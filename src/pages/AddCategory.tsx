import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { CategoryForm } from '../components/menu/CategoryForm'

export default function AddCategory() {
  const navigate = useNavigate()

  function goBack() {
    navigate('/menu/categories?tab=category')
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
          tag: '',
          status: true,
          logoName: '',
          swiggyImageName: '',
          offlineImageName: '',
        }}
        onCancel={goBack}
        onSave={goBack}
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
