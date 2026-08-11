import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { CategoryForm } from '../components/menu/CategoryForm'
import { getMenuCategoryById } from '../mocks/menuCategoriesData'

export default function EditCategory() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const category = useMemo(() => getMenuCategoryById(id), [id])

  function goBack() {
    navigate('/menu/categories?tab=category')
  }

  if (!category) {
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
            <span className="font-semibold text-ink">Edit Category</span>
          </span>
        }
      >
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
          <span className="font-semibold text-ink">Edit Category</span>
        </span>
      }
    >
      <CategoryForm
        title="Edit Category"
        initial={{
          name: category.name,
          onlineDisplayName: category.onlineDisplayName,
          tag: '',
          status: category.status === 'Active',
          logoName: '',
          swiggyImageName: '',
          offlineImageName: '',
        }}
        onCancel={goBack}
        onSave={goBack}
      />
    </MenuPageShell>
  )
}
