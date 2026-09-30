import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  CategoryForm,
  type CategoryFormValues,
} from '../components/menu/CategoryForm'
import { useAuth } from '../auth/AuthContext'
import { getCategoryApi, updateCategoryApi } from '../services/menuService'
import type { Category, CategoryPayload } from '../types/menu'
import { showToast } from '../utils/toast'

export default function EditCategory() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId || !id) return
    getCategoryApi(encryptedOutletId, id)
      .then((row) => {
        if (cancelled) return
        setCategory(row)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        showToast(
          error instanceof Error ? error.message : 'Failed to load category',
        )
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, id])

  function goBack() {
    navigate('/menu/categories?tab=category')
  }

  async function handleSave(values: CategoryFormValues) {
    if (!encryptedOutletId || !id) return
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
      await updateCategoryApi(encryptedOutletId, id, payload)
      showToast('Category updated successfully')
      goBack()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update category',
      )
    }
  }

  const title = (
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
      <span className="font-semibold text-ink">Edit Category</span>
    </span>
  )

  if (loading) {
    return (
      <MenuPageShell backTo="/menu/categories?tab=category" title={title}>
        <div className="rounded-lg border border-line bg-card p-8 text-center">
          <p className="text-sm font-semibold text-ink">Loading category…</p>
        </div>
      </MenuPageShell>
    )
  }

  if (!category) {
    return (
      <MenuPageShell backTo="/menu/categories?tab=category" title={title}>
        <div className="rounded-lg border border-line bg-card p-8 text-center">
          <p className="text-sm font-semibold text-ink">Category not found</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-md border border-primary px-4 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Back to Categories
          </button>
        </div>
      </MenuPageShell>
    )
  }

  return (
    <MenuPageShell backTo="/menu/categories?tab=category" title={title}>
      <CategoryForm
        title="Edit Category"
        initial={{
          name: category.name,
          onlineDisplayName: category.online_display_name,
          parentCategoryId: category.parent_id,
          rank: category.rank,
          tag: '',
          status: category.is_active,
          logoName: '',
          swiggyImageName: '',
          offlineImageName: '',
        }}
        onCancel={goBack}
        onSave={handleSave}
      />
    </MenuPageShell>
  )
}