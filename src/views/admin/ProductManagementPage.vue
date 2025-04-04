<template>
    <div>
      <div class="app-content-header">
          <div class="container-fluid">
              <div class="row">
                  <div class="col-sm-6">
                      <h1 class="page-heading">Quản lý Sản phẩm</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-end">
                          <li class="breadcrumb-item"><a href="#">Home</a></li>
                          <li class="breadcrumb-item active" aria-current="page">
                              Quản lý Sản phẩm
                          </li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>
      <div class="app-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card card-primary card-outline"> <div class="card-header">
                  <h3 class="card-title">Danh sách sản phẩm</h3>
                  <div class="card-tools">
                     <button type="button" class="btn btn-primary btn-sm">
                       <iconify-icon icon="mdi:plus" class="me-1"></iconify-icon> Thêm sản phẩm
                     </button>
                    <button type="button" class="btn btn-tool" data-lte-toggle="card-collapse" title="Collapse">
                      <iconify-icon icon="mdi:minus"></iconify-icon>
                    </button>
                     <button type="button" class="btn btn-tool" data-lte-toggle="card-remove" title="Remove">
                       <iconify-icon icon="mdi:close"></iconify-icon>
                    </button>
                  </div>
                </div>
                <div class="card-body p-0">
                   <table class="table table-striped table-hover projects"> <thead>
                          <tr>
                              <th style="width: 1%">ID</th>
                              <th style="width: 15%">Ảnh</th>
                              <th style="width: 30%">Tên sản phẩm</th>
                              <th>Danh mục</th>
                              <th style="width: 15%">Giá</th>
                              <th style="width: 8%" class="text-center">Còn hàng</th>
                              <th style="width: 20%">Hành động</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                             <td>101</td>
                             <td>
                                 <img alt="Ảnh SP" class="table-avatar" src="/placeholder-image.jpg" style="width: 40px; height: 40px; object-fit: cover;">
                             </td>
                             <td><a>Áo Thun Cotton Basic</a></td>
                             <td>Thời trang nam</td>
                             <td>250,000 đ</td>
                             <td class="text-center"><span class="badge text-bg-success">Có</span></td>
                             <td class="project-actions text-end">
                                 <a class="btn btn-primary btn-sm" href="#"><iconify-icon icon="mdi:eye-outline" class="me-1"></iconify-icon>Xem</a>
                                 <a class="btn btn-info btn-sm ms-1" href="#"><iconify-icon icon="mdi:pencil" class="me-1"></iconify-icon>Sửa</a>
                                 <a class="btn btn-danger btn-sm ms-1" href="#"><iconify-icon icon="mdi:trash-can-outline" class="me-1"></iconify-icon>Xóa</a>
                             </td>
                          </tr>
                          <tr>
                             <td>102</td>
                             <td>
                                 <img alt="Ảnh SP" class="table-avatar" src="/placeholder-image.jpg" style="width: 40px; height: 40px; object-fit: cover;">
                             </td>
                             <td><a>Quần Jean Nữ Slimfit</a></td>
                             <td>Thời trang nữ</td>
                             <td>599,000 đ</td>
                             <td class="text-center"><span class="badge text-bg-danger">Không</span></td>
                              <td class="project-actions text-end">
                                 <a class="btn btn-primary btn-sm" href="#"><iconify-icon icon="mdi:eye-outline" class="me-1"></iconify-icon>Xem</a>
                                 <a class="btn btn-info btn-sm ms-1" href="#"><iconify-icon icon="mdi:pencil" class="me-1"></iconify-icon>Sửa</a>
                                 <a class="btn btn-danger btn-sm ms-1" href="#"><iconify-icon icon="mdi:trash-can-outline" class="me-1"></iconify-icon>Xóa</a>
                             </td>
                          </tr>
                           </tbody>
                   </table>
                </div>
                <div class="card-footer clearfix">
                   <ul class="pagination pagination-sm m-0 float-end">
                      <li class="page-item"><a class="page-link" href="#">«</a></li>
                      <li class="page-item"><a class="page-link" href="#">1</a></li>
                      <li class="page-item"><a class="page-link" href="#">2</a></li>
                      <li class="page-item"><a class="page-link" href="#">3</a></li>
                      <li class="page-item"><a class="page-link" href="#">»</a></li>
                    </ul>
                </div>
              </div>
              </div>
          </div>
           </div>
        </div>
      </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  
  onMounted(() => {
    console.log("Product Management Page Mounted");
    // Gọi API lấy danh sách sản phẩm
  });
  </script>
  
  <style scoped>
  /* CSS Scope */
  .page-heading {
      font-size: 1.5rem;
      margin-bottom: 0;
  }
  .project-actions .btn {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
  }
  .project-actions iconify-icon {
      vertical-align: text-bottom;
  }
  .table-avatar {
      border-radius: 50%; /* Làm ảnh tròn nếu muốn */
  }
  </style>