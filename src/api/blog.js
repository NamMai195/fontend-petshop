import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const BLOG_COLLECTION = 'blogPosts'; // Firestore collection name

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dqhzwvfl8';
const CLOUDINARY_UPLOAD_PRESET = 'IMGPETSHOP'; // Using default unsigned upload preset

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to upload image to Cloudinary
const uploadImage = async (imageFile) => {
  try {
    console.log('Starting image upload to Cloudinary:', imageFile.name);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract the public ID from the URL
    const publicId = imageUrl.split('/').pop().split('.')[0];
    console.log('Deleting image:', publicId);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_id: publicId,
        invalidate: true
      })
    });
    console.log('Cloudinary delete response:', response.data);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw error here as this is a cleanup operation
  }
};

const blogApiService = {
  /**
   * Fetches all blog posts from Firestore, ordered by creation date.
   * @returns {Promise<Array>} A promise that resolves to an array of blog posts with IDs.
   */
  getPosts: async () => {
    try {
      console.log('Fetching all blog posts');
      const q = query(collection(db, BLOG_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: formatDate(data.createdAt),
          updatedAt: formatDate(data.updatedAt)
        };
      });
      
      console.log('Fetched posts:', posts.length);
      return posts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },

  /**
   * Creates a new blog post in Firestore, handling image upload.
   * @param {object} postData - The data for the new blog post (excluding ID).
   * @param {File|null} imageFile - The image file to upload (optional).
   * @returns {Promise<object>} A promise that resolves to the newly created blog post object with ID.
   */
  createPost: async (postData, imageFile = null) => {
    try {
      console.log('Creating new blog post with data:', postData);
      
      let imageUrl = null;
      if (imageFile) {
        console.log('Uploading image file:', imageFile.name);
        imageUrl = await uploadImage(imageFile);
        console.log('Image uploaded, URL:', imageUrl);
      }

      const now = new Date().toISOString();
      const postPayload = {
        ...postData,
        imageUrl: imageUrl,
        createdAt: now,
        updatedAt: now,
      };
      console.log('Final post payload:', postPayload);

      const blogCollectionRef = collection(db, BLOG_COLLECTION);
      console.log('Blog collection reference:', blogCollectionRef);

      const docRef = await addDoc(blogCollectionRef, postPayload);
      console.log('Blog post created with ID:', docRef.id);

      return {
        id: docRef.id,
        ...postPayload,
        createdAt: formatDate(postPayload.createdAt),
        updatedAt: formatDate(postPayload.updatedAt)
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      // If image was uploaded but document creation failed, clean up the image
      if (postData.imageUrl) {
        await deleteImage(postData.imageUrl).catch(e => console.error("Cleanup failed:", e));
      }
      throw error;
    }
  },

  /**
   * Fetches a single blog post from Firestore by ID.
   * @param {string} postId - The ID of the post to fetch.
   * @returns {Promise<object>} A promise that resolves to the blog post object with ID.
   */
  getPost: async (postId) => {
    try {
      console.log('Fetching blog post:', postId);
      const docRef = doc(db, BLOG_COLLECTION, postId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: formatDate(data.createdAt),
          updatedAt: formatDate(data.updatedAt)
        };
      } else {
        throw new Error('Blog post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  /**
   * Updates an existing blog post in Firestore, handling image upload/replacement.
   * @param {string} postId - The ID of the post to update.
   * @param {object} updateData - The updated data for the blog post.
   * @param {File|null} newImageFile - The new image file to upload (optional). Pass null if image not changed.
   * @returns {Promise<object>} A promise that resolves to the updated blog post object with ID.
   */
  updatePost: async (postId, updateData, newImageFile = null) => {
    try {
      console.log('Updating blog post:', postId);
      const docRef = doc(db, BLOG_COLLECTION, postId);
      
      // Get the current post data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Blog post not found');
      }
      
      const currentData = docSnap.data();
      let imageUrl = currentData.imageUrl; // Keep old image URL by default
      
      // Handle image update only if new image is provided
      if (newImageFile) {
        imageUrl = await uploadImage(newImageFile);
      }

      // Create update payload, only include fields that have changed
      const { image, ...cleanUpdateData } = updateData;
      const updatePayload = {
        title: updateData.title || currentData.title,
        author: updateData.author || currentData.author,
        content: updateData.content || currentData.content,
        status: updateData.status || currentData.status,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updatePayload);
      
      return {
        id: postId,
        ...updatePayload,
        createdAt: formatDate(currentData.createdAt),
        updatedAt: formatDate(updatePayload.updatedAt)
      };
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  },

  /**
   * Deletes a blog post from Firestore and its associated image from Cloudinary.
   * @param {string} postId - The ID of the post to delete.
   * @returns {Promise<void>} A promise that resolves when the post and image are deleted.
   */
  deletePost: async (postId) => {
    try {
      console.log('Deleting blog post:', postId);
      
      // Get the post data first to get the image URL
      const docRef = doc(db, BLOG_COLLECTION, postId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Delete the image if it exists
        if (data.imageUrl) {
          await deleteImage(data.imageUrl);
        }
        // Delete the document
        await deleteDoc(docRef);
        console.log('Blog post deleted successfully');
      } else {
        throw new Error('Blog post not found');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  },
};

export default blogApiService;
