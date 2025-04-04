<template>
    <div>
      <div class="app-content-header">
        <div class="container-fluid">
          <div class="row">
            <div class="col-sm-6">
              <h1 class="page-heading">Quản lý Đơn hàng</h1>
            </div>
            <div class="col-sm-6">
              <ol class="breadcrumb float-sm-end">
                <li class="breadcrumb-item"><a href="#">Home</a></li>
                <li class="breadcrumb-item active" aria-current="page">
                  Quản lý Đơn hàng
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
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Danh sách đơn hàng</h3>
                  <div class="card-tools">
                    <button type="button" class="btn btn-tool" data-lte-toggle="card-collapse" title="Collapse">
                      <iconify-icon icon="mdi:minus"></iconify-icon>
                    </button>
                  </div>
                </div>
                <div class="card-body p-0">
                  <table class="table table-striped projects">
                    <thead>
                      <tr>
                        <th style="width: 10%">Mã ĐH</th>
                        <th style="width: 20%">Khách hàng</th>
                        <th style="width: 15%">Tổng tiền</th>
                        <th style="width: 15%" class="text-center">Trạng thái</th>
                        <th style="width: 15%">Ngày tạo</th>
                        <th style="width: 25%">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>#ORD-001</td>
                        <td>Nguyễn Văn A</td>
                        <td>1,250,000 đ</td>
                        <td class="text-center"><span class="badge text-bg-warning">Chờ xử lý</span></td>
                        <td>01/04/2025</td>
                        <td class="project-actions text-end">
                          <a class="btn btn-primary btn-sm" href="#"><iconify-icon icon="mdi:eye-outline" class="me-1"></iconify-icon>Xem</a>
                          <a class="btn btn-info btn-sm ms-1" href="#"><iconify-icon icon="mdi:truck-delivery-outline" class="me-1"></iconify-icon>Xử lý</a>
                          <a class="btn btn-danger btn-sm ms-1" href="#"><iconify-icon icon="mdi:cancel" class="me-1"></iconify-icon>Hủy</a>
                        </td>
                      </tr>
                       <tr>
                        <td>#ORD-002</td>
                        <td>Trần Thị B</td>
                        <td>899,000 đ</td>
                        <td class="text-center"><span class="badge text-bg-success">Đã giao</span></td>
                        <td>31/03/2025</td>
                        <td class="project-actions text-end">
                          <a class="btn btn-primary btn-sm" href="#"><iconify-icon icon="mdi:eye-outline" class="me-1"></iconify-icon>Xem</a>
                         </td>
                      </tr>
                      </tbody>
                  </table>
                </div>
                <div class="card-footer clearfix">
                   <ul class="pagination pagination-sm m-0 float-end">
                      <li class="page-item"><a class="page-link" href="#">«</a></li>
                      <li class="page-item"><a class="page-link" href="#">1</a></li>
                      <li class="page-item"><a class="page-link" href="#">»</a></li>
                    </ul>
                </div>
              </div>
              </div>
          </div>
          </div></div>
      </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  
  onMounted(() => {
    console.log("Order Management Page Mounted");
    // Gọi API lấy danh sách đơn hàng
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
  </style>