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
                      <i class="fa-solid fa-trash-can"></i>
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

    <!-- Test Type Selection Modal -->
    <TestTypeSelectionModal
      v-if="showTestTypeSelection"
      :test-types="testTypes"
      @close="showTestTypeSelection = false"
      @select="handleTestTypeSelection"
    />

    <!-- IELTS Reading Modal -->
    <IELTSReadingModal
      v-if="showIELTSReadingModal"
      :test-type="selectedTestTypeName"
      :test-type-id="selectedTestTypeId"
      :is-saving="isLoading"
      @close="closeAllModals"
      @save="saveTest"
    />

    <!-- IELTS Listening Modal -->
    <IELTSListeningModal
      v-if="showIELTSListeningModal"
      :test-type="selectedTestTypeName"
      :test-type-id="selectedTestTypeId"
      :is-saving="isLoading"
      @close="closeAllModals"
      @save="saveTest"
    />

    <!-- IELTS Writing Modal -->
    <IELTSWritingModal
      v-if="showIELTSWritingModal"
      :test-type="selectedTestTypeName"
      :test-type-id="selectedTestTypeId"
      :is-saving="isLoading"
      @close="closeAllModals"
      @save="saveTest"
    />

    <!-- TOEIC Modal -->
    <TOEICModal
      v-if="showTOEICModal"
      :test-type-id="selectedTestTypeId"
      :is-saving="isLoading"
      @close="closeAllModals"
      @save="saveTest"
    />

    <!-- TOEIC SW Modal -->
    <TOEICSWModal
      v-if="showTOEICSWModal"
      :test-type-id="selectedTestTypeId"
      :is-saving="isLoading"
      @close="closeAllModals"
      @save="saveTest"
    />

    <!-- Update Test Modal (keeping old modal for editing) -->
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
import TestTypeSelectionModal from './TestTypeSelectionModal.vue'
import IELTSReadingModal from './IELTSReadingModal.vue'
import IELTSListeningModal from './IELTSListeningModal.vue'
import IELTSWritingModal from './IELTSWritingModal.vue'
import TOEICModal from './TOEICModal.vue'
import TOEICSWModal from './TOEICSWModal.vue'
import UpdateTestModal from './UpdateTestModal.vue'
import { TestAdminAPI, TestDataHelpers } from '@/services/TestAdminAPI.js'

// Reactive data
const searchQuery = ref('')
const filterType = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
const isLoading = ref(false)

// Modal states
const showTestTypeSelection = ref(false)
const showIELTSReadingModal = ref(false)
const showIELTSListeningModal = ref(false)
const showIELTSWritingModal = ref(false)
const showTOEICModal = ref(false)
const showTOEICSWModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const testToDelete = ref(null)
const editingTestId = ref(null)
const selectedTestTypeId = ref(null)
const selectedTestTypeName = ref('')

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
  showTestTypeSelection.value = true
}

const handleTestTypeSelection = (selection) => {
  selectedTestTypeId.value = selection.testType.id
  selectedTestTypeName.value = selection.testType.name
  
  // Close test type selection modal
  showTestTypeSelection.value = false
  
  // Open appropriate modal based on selection
  if (selection.testType.name === 'IELTS Academic' || selection.testType.name === 'IELTS General') {
    if (selection.skill && selection.skill.key === 'reading') {
      showIELTSReadingModal.value = true
    } else if (selection.skill && selection.skill.key === 'listening') {
      showIELTSListeningModal.value = true
    } else if (selection.skill && selection.skill.key === 'writing') {
      showIELTSWritingModal.value = true
    }
  } else if (selection.testType.name === 'TOEIC') {
    showTOEICModal.value = true
  } else if (selection.testType.name === 'TOEIC SW') {
    showTOEICSWModal.value = true
  }
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

    // Check if this is a create operation (any of the specialized modals are open)
    const isCreating = showIELTSReadingModal.value || showIELTSListeningModal.value || 
                      showIELTSWritingModal.value || showTOEICModal.value || showTOEICSWModal.value
    
    if (isCreating) {
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
    
    // Close appropriate modal
    if (isCreating) {
      closeAllModals()
    } else {
      closeModal()
    }
  } catch (error) {
    console.error('Error saving test:', error)
    alert('Lỗi khi lưu đề thi: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showEditModal.value = false
  editingTestId.value = null
}

const closeAllModals = () => {
  showTestTypeSelection.value = false
  showIELTSReadingModal.value = false
  showIELTSListeningModal.value = false
  showIELTSWritingModal.value = false
  showTOEICModal.value = false
  showTOEICSWModal.value = false
  showEditModal.value = false
  editingTestId.value = null
  selectedTestTypeId.value = null
  selectedTestTypeName.value = ''
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(async () => {
  console.log('Test Management page loaded')
  await loadAllTests()
})
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="./TestManagement.css" scoped></style>