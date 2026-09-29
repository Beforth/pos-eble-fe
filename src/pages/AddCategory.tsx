import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  CategoryForm,
  type CategoryFormValues,
} from '../components/menu/CategoryForm'
import { useAuth } from '../auth/AuthContext'
import { createCategoryApi } from '../services/menuService'
import type { CategoryPayload } from '../types/menu'
import { showToast } from '../utils/toast'

export default function AddCategory() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()

  function goBack() {
    navigate('/menu/categories?tab=category')
  }

  async function handleSave(values: CategoryFormValues) {
    if (!encryptedOutletId) return
    if (!values.name.trim()) {
      showToast('Category name is required')
      return
    }
    const payload: CategoryPayload = {
      name: values.name.trim(),
      parent_category_id: values.parentCategoryId || null,
      online_display_name: values.onlineDisplayName || undefined,
      rank: values.rank,
      is_active: values.status,
    }
    try {
      await createCategoryApi(encryptedOutletId, payload)
      showToast('Category created successfully')
      goBack()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create category',
      )
    }
  }

  return (
    <MenuPageShell
      backTo="/menu/categories?tab=category"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link
            to="/menu/categories?tab=category"
            className="text-primary hover:underline"
          >
            Category Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Category</span>
        </span>
      }
    >
      <CategoryForm
        title="Add Category"
        initial={{
          name: '',
          onlineDisplayName: '',
          parentCategoryId: null,
          rank: 0,
          tag: '',
          status: true,
          logoName: '',
          swiggyImageName: '',
          offlineImageName: '',
        }}
        onCancel={goBack}
        onSave={handleSave}
        headerActions={
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        }
      />
    </MenuPageShell>
  )
}