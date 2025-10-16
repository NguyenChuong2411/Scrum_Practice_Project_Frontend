<template>
  <div class="test-management-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="header-container">
        <h1 class="page-title">QUẢN LÝ ĐỀ THI</h1>
        <p class="page-subtitle">Tạo, chỉnh sửa và quản lý các đề thi của bạn</p>
      </div>
    </section>

    <!-- Management Tools -->
    <section class="management-section">
      <div class="content-container">
        <!-- Action Bar -->
        <div class="action-bar">
          <div class="search-tools">
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Tìm kiếm đề thi..."
                class="search-input"
              />
            </div>
            <select v-model="filterType" class="filter-select">
              <option value="all">Tất cả loại</option>
              <option value="IELTS Academic">IELTS Academic</option>
              <option value="IELTS General">IELTS General</option>
              <option value="TOEIC">TOEIC</option>
              <option value="TOEIC SW">TOEIC SW</option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="action-btn primary" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Tạo đề thi mới
            </button>
          </div>
        </div>

        <!-- Tests Table -->
        <div class="tests-table-container">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Đang tải...</span>
            </div>
          </div>
          
          <table class="tests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đề thi</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Câu hỏi</th>
                <th>Ngày tạo</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="test in paginatedTests" :key="test.id" class="test-row">
                <td class="test-id">#{{ test.id }}</td>
                <td class="test-title">
                  <div class="title-container">
                    <span class="title">{{ test.title }}</span>
                    <span class="description">{{ test.description || 'Không có mô tả' }}</span>
                  </div>
                </td>
                <td>
                  <span class="test-type" :class="getTypeClass(test.testType)">
                    {{ test.testType }}
                  </span>
                </td>
                <td>{{ test.durationMinutes || 0 }} phút</td>
                <td>{{ test.questionCount || 0 }} câu</td>
                <td class="created-date">{{ formatDate(test.createdAt) }}</td>
                <td class="created-date">{{ formatDate(test.updatedAt) }}</td>
                <td class="actions">
                  <div class="action-buttons-group">
                    <button 
                      class="btn-icon view" 
                      @click="viewTest(test)"
                      title="Xem chi tiết"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    <button 
                      class="btn-icon edit" 
                      @click="editTest(test)"
                      title="Chỉnh sửa"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button 
                      class="btn-icon delete" 
                      @click="confirmDelete(test)"
                      title="Xóa"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-info">
          Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredTests.length) }} 
          trong tổng {{ filteredTests.length }} đề thi
        </div>
        
        <Pagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </section>

    <!-- Create Test Modal -->
    <CreateNewTestModal
      v-if="showCreateModal"
      :test-types="testTypes"
      :is-saving="isLoading"
      @close="closeModal"
      @save="saveTest"
    />

    <!-- Update Test Modal -->
    <UpdateTestModal
      v-if="showEditModal"
      :test-types="testTypes"
      :test-id="editingTestId"
      :is-saving="isLoading"
      @close="closeModal"
      @save="saveTest"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h3>Xác nhận xóa</h3>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn xóa đề thi "<strong>{{ testToDelete?.title }}</strong>"?</p>
          <p class="warning">Hành động này không thể hoàn tác!</p>
        </div>
        <div class="modal-actions">
          <button class="btn secondary" @click="showDeleteModal = false">
            Hủy bỏ
          </button>
          <button class="btn danger" @click="deleteTest" :disabled="isLoading">
            <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
            {{ isLoading ? 'Đang xóa...' : 'Xóa đề thi' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Pagination from '@/components/Pagination.vue'
import CreateNewTestModal from './CreateNewTestModal.vue'
import UpdateTestModal from './UpdateTestModal.vue'
import { TestAdminAPI, TestDataHelpers } from '@/services/TestAdminAPI.js'

// Reactive data
const searchQuery = ref('')
const filterType = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
const isLoading = ref(false)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const testToDelete = ref(null)
const editingTestId = ref(null)

// Thay thế sample data bằng dữ liệu thực từ API
const allTests = ref([])

// Test types - có thể lấy từ API riêng
const testTypes = ref([
  { id: 1, name: 'IELTS Academic' },
  { id: 2, name: 'IELTS General' },
  { id: 3, name: 'TOEIC' },
  { id: 4, name: 'TOEIC SW' }
])

// Computed properties
const filteredTests = computed(() => {
  let filtered = allTests.value

  // Filter by type - sử dụng testType thay vì type cũ
  if (filterType.value !== 'all') {
    filtered = filtered.filter(test => test.testType === filterType.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(test => 
      test.title.toLowerCase().includes(query) ||
      (test.description && test.description.toLowerCase().includes(query)) ||
      test.testType.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredTests.value.length / itemsPerPage)
})

const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTests.value.slice(start, end)
})

const getTypeClass = (testType) => {
  const typeMap = {
    'IELTS Academic': 'ielts-academic',
    'IELTS General': 'ielts-general',
    'TOEIC': 'toeic',
    'TOEIC SW': 'toeic-sw'
  }
  return typeMap[testType] || ''
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

// API functions
const loadAllTests = async () => {
  isLoading.value = true
  try {
    const tests = await TestAdminAPI.getAllTestsForAdmin()
    allTests.value = tests
  } catch (error) {
    console.error('Error loading tests:', error)
    alert('Không thể tải danh sách đề thi: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// CRUD operations
const viewTest = (test) => {
  console.log('Viewing test:', test)
  // TODO: Navigate to test detail page or open view modal
}

const editTest = async (test) => {
  editingTestId.value = test.id
  showEditModal.value = true
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const confirmDelete = (test) => {
  testToDelete.value = test
  showDeleteModal.value = true
}

const deleteTest = async () => {
  if (testToDelete.value) {
    isLoading.value = true
    try {
      await TestAdminAPI.deleteTest(testToDelete.value.id)
      // Remove from local array
      const index = allTests.value.findIndex(t => t.id === testToDelete.value.id)
      if (index > -1) {
        allTests.value.splice(index, 1)
      }
      showDeleteModal.value = false
      testToDelete.value = null
      console.log('Test deleted successfully')
      alert('Xóa đề thi thành công!')
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Không thể xóa đề thi: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }
}

const saveTest = async (testData) => {
  isLoading.value = true
  try {
    // Validate form data
    const validationErrors = TestDataHelpers.validateTestData(testData)
    if (validationErrors.length > 0) {
      alert('Dữ liệu không hợp lệ:\n' + validationErrors.join('\n'))
      return
    }

    if (showCreateModal.value) {
      // Create new test
      const newTestId = await TestAdminAPI.createTest(testData)
      console.log('New test created with ID:', newTestId)
      alert('Tạo đề thi mới thành công!')
      
      // Reload the test list
      await loadAllTests()
    } else if (showEditModal.value) {
      // Update existing test
      await TestAdminAPI.updateTest(testData.id, testData)
      console.log('Test updated successfully')
      alert('Cập nhật đề thi thành công!')
      
      // Reload the test list
      await loadAllTests()
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving test:', error)
    alert('Lỗi khi lưu đề thi: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTestId.value = null
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(async () => {
  console.log('Test Management page loaded')
  await loadAllTests()
})
</script>

<style scoped>
.test-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: var(--font-family-base, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
}

/* Header */
.page-header {
  background: transparent;
  color: white;
  padding: 3rem 0 2rem 0;
  text-align: center;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

/* Management Section */
.management-section {
  background: #f8fafc;
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
  border-radius: 2rem 2rem 0 0;
  margin-top: 1rem;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-tools {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #F6871F;
  box-shadow: 0 0 0 3px rgba(246, 135, 31, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: white;
  min-width: 160px;
}

.filter-select:focus {
  outline: none;
  border-color: #F6871F;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn.primary {
  background: #F6871F;
  color: white;
}

.action-btn.primary:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #6b7280;
  color: white;
}

.action-btn.secondary:hover {
  background: #374151;
}

/* Table */
.tests-table-container {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #F6871F;
  font-weight: 500;
}

.loading-spinner i {
  font-size: 2rem;
}

.tests-table {
  width: 100%;
  border-collapse: collapse;
}

.tests-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.tests-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.test-row:hover {
  background: #f9fafb;
}

.test-id {
  font-weight: 600;
  color: #6b7280;
}

.title-container .title {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.title-container .description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.test-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.test-type.ielts-academic { background: #dbeafe; color: #1e40af; }
.test-type.ielts-general { background: #dcfce7; color: #16a34a; }
.test-type.toeic { background: #fef3c7; color: #d97706; }
.test-type.toeic-sw { background: #fce7f3; color: #be185d; }

.attempts-count {
  font-weight: 600;
  color: #F6871F;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.active { background: #dcfce7; color: #16a34a; }
.status.draft { background: #fef3c7; color: #d97706; }
.status.archived { background: #f3f4f6; color: #6b7280; }

.created-date {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons-group {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon.view { background: #dbeafe; color: #1e40af; }
.btn-icon.view:hover { background: #bfdbfe; }

.btn-icon.edit { background: #fef3c7; color: #d97706; }
.btn-icon.edit:hover { background: #fed7aa; }

.btn-icon.duplicate { background: #e0e7ff; color: #6366f1; }
.btn-icon.duplicate:hover { background: #c7d2fe; }

.btn-icon.delete { background: #fecaca; color: #dc2626; }
.btn-icon.delete:hover { background: #fca5a5; }

/* Pagination Info */
.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Delete Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content.small {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem 2rem 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 0 2rem;
}

.warning {
  color: #dc2626;
  font-weight: 500;
}

.modal-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background: #d1d5db;
}

.btn.danger {
  background: #dc2626;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 1024px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-tools {
    min-width: unset;
  }
  
  .tests-table-container {
    overflow-x: auto;
  }
  
  .tests-table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {
  .content-container {
    padding: 0 1rem;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 2rem;
  }
}
</style>