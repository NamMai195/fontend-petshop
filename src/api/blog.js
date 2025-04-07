import { db, storage } from '@/firebase/config'; // Import Firestore DB and Storage
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp, // Import Timestamp for date handling
} from 'firebase/firestore';
import {
  ref as storageRef, // Rename ref to avoid conflict with Vue's ref
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const BLOG_COLLECTION = 'blogs'; // Firestore collection name

// Helper function to upload image and get URL
const uploadImage = async (imageFile) => {
  if (!imageFile) return null;
  const imageRef = storageRef(storage, `blog_images/${Date.now()}_${imageFile.name}`);
  try {
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Helper function to delete image from storage
const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return; // Basic check
  try {
    const imageRef = storageRef(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    // Handle errors (e.g., file not found), maybe log them
    if (error.code !== 'storage/object-not-found') {
      console.error("Error deleting image:", error);
      // Decide if you want to throw the error or just log it
      // throw error;
    } else {
      console.warn("Image not found for deletion, might have been already deleted:", imageUrl);
    }
  }
};


const blogApiService = {
  /**
   * Fetches all blog posts from Firestore, ordered by creation date.
   * @returns {Promise<Array>} A promise that resolves to an array of blog posts with IDs.
   */
  getPosts: async () => {
    try {
      const blogCollectionRef = collection(db, BLOG_COLLECTION);
      // Order by 'createdAt' timestamp, descending
      const q = query(blogCollectionRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JS Date object or string if needed
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleDateString() : null,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toLocaleDateString() : null,
      }));
      return posts;
    } catch (error) {
      console.error('Error fetching blog posts from Firestore:', error.code, error.message, error);
      // You might want to throw a more specific error or handle different error codes
      throw new Error(`Firestore Error (${error.code}): Failed to fetch blog posts.`);
    }
  },

  // getPostById is less common with Firestore if you fetch all, but can be implemented if needed
  // getPostById: async (postId) => { ... }

  /**
   * Creates a new blog post in Firestore, handling image upload.
   * @param {object} postData - The data for the new blog post (excluding ID).
   * @param {File|null} imageFile - The image file to upload (optional).
   * @returns {Promise<object>} A promise that resolves to the newly created blog post object with ID.
   */
  createPost: async (postData, imageFile = null) => {
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const postPayload = {
        ...postData,
        imageUrl: imageUrl, // Add image URL to the data
        createdAt: Timestamp.now(), // Use Firestore Timestamp for server-side time
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, BLOG_COLLECTION), postPayload);
      return { id: docRef.id, ...postPayload }; // Return the post with its new ID
    } catch (error) {
      console.error('Error creating blog post in Firestore:', error);
      // Consider deleting uploaded image if Firestore write fails
      if (postData.imageUrl) {
         await deleteImage(postData.imageUrl).catch(e => console.error("Cleanup failed:", e));
      }
      throw error;
    }
  },

  /**
   * Updates an existing blog post in Firestore, handling image upload/replacement.
   * @param {string} postId - The ID of the post to update.
   * @param {object} postData - The updated data for the blog post.
   * @param {File|null} imageFile - The new image file to upload (optional). Pass null if image not changed.
   * @param {string|null} existingImageUrl - The URL of the current image, needed for deletion if replaced.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updatePost: async (postId, postData, imageFile = null, existingImageUrl = null) => {
    try {
      const postPayload = { ...postData }; // Start with the text data
      let newImageUrl = postData.imageUrl; // Keep existing URL unless new file is provided

      if (imageFile) {
        // If there's a new image, upload it
        newImageUrl = await uploadImage(imageFile);
        postPayload.imageUrl = newImageUrl; // Update payload with new URL

        // If there was an old image and the new upload was successful, delete the old one
        if (existingImageUrl && newImageUrl) {
          await deleteImage(existingImageUrl);
        }
      }
      // If imageFile is null, postPayload.imageUrl retains its value from postData

      postPayload.updatedAt = Timestamp.now(); // Update timestamp

      const postRef = doc(db, BLOG_COLLECTION, postId);
      await updateDoc(postRef, postPayload);

    } catch (error) {
      console.error(`Error updating blog post with ID ${postId} in Firestore:`, error);
      // If update failed but a new image was uploaded, try to clean it up
      if (imageFile && newImageUrl && newImageUrl !== existingImageUrl) {
         await deleteImage(newImageUrl).catch(e => console.error("Update failed, cleanup failed:", e));
      }
      throw error;
    }
  },

  /**
   * Deletes a blog post from Firestore and its associated image from Storage.
   * @param {string} postId - The ID of the post to delete.
   * @param {string|null} imageUrl - The URL of the image associated with the post (optional).
   * @returns {Promise<void>} A promise that resolves when the post and image are deleted.
   */
  deletePost: async (postId, imageUrl = null) => {
    try {
      // Delete the Firestore document first
      const postRef = doc(db, BLOG_COLLECTION, postId);
      await deleteDoc(postRef);

      // Then delete the image from Storage if URL is provided
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
    } catch (error) {
      console.error(`Error deleting blog post with ID ${postId} from Firestore:`, error);
      throw error;
    }
  },
};

export default blogApiService;
