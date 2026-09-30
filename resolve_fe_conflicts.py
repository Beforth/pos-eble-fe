import os, re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '<<<<<<<' not in content:
        return

    # 1. Handle specific files first
    if filepath.endswith('InventoryPageShell.tsx'):
        content = re.sub(
            r'<<<<<<< HEAD\n\s*const \{ hasPermission \} = useAuth\(\)\n\s*const \[collapsed, setCollapsed\] = useState\(false\)\n=======\n\s*const \{ collapsed, toggleCollapsed \} = useChrome\(\)\n>>>>>>> origin/main',
            '  const { hasPermission } = useAuth()\n  const { collapsed, toggleCollapsed } = useChrome()',
            content
        )

    if filepath.endswith('InventorySidebar.tsx'):
        content = re.sub(
            r'<<<<<<< HEAD\n\s*const canReadManageStock = canReadAvailableStock \|\| canReadClosingStock\n=======\n>>>>>>> origin/main',
            '  const canReadManageStock = canReadAvailableStock || canReadClosingStock',
            content
        )

    if filepath.endswith('KotTable.tsx'):
        content = re.sub(
            r'<<<<<<< HEAD\nimport \{ Eye, Info, List, Pencil, PencilLine \} from \'lucide-react\'\n=======\nimport \{\n  ArrowDown,\n  Eye,\n  Info,\n  List,\n  Pencil,\n  PencilLine,\n  ShoppingCart,\n\} from \'lucide-react\'\n>>>>>>> origin/main',
            "import {\n  ArrowDown,\n  Eye,\n  Info,\n  List,\n  Pencil,\n  PencilLine,\n  ShoppingCart,\n} from 'lucide-react'",
            content
        )
        content = re.sub(
            r'<<<<<<< HEAD\nexport function KotTable\(\{ rows, onEdit, onView, onDetails \}: KotTableProps\) \{\n  const \{ sortKey, sortDir, toggleSort, visible \} = useListQuery\([\s\S]*?\n=======\nexport function KotTable\(\{\n  rows,\n  onEdit,\n  onView,\n  onDetails,\n  onOpenInBilling,\n\}: KotTableProps\) \{\n>>>>>>> origin/main',
            "export function KotTable({\n  rows,\n  onEdit,\n  onView,\n  onDetails,\n  onOpenInBilling,\n}: KotTableProps) {\n  const { sortKey, sortDir, toggleSort, visible } = useListQuery(\n    rows,\n    (row) => [\n      row.kotId,\n      row.orderType,\n      row.customerName,\n      row.customerPhone,\n      row.itemCount,\n      row.items,\n      row.status,\n      row.billPrintDate,\n      row.completeDuration,\n      row.created,\n    ],\n    (row, key) => {\n      if (key === 'orderType') return row.orderType\n      if (key === 'customerName') return row.customerName\n      if (key === 'customerPhone') return row.customerPhone\n      if (key === 'itemCount') return row.itemCount\n      if (key === 'items') return row.items\n      if (key === 'status') return row.status\n      if (key === 'billPrintDate') return row.billPrintDate\n      if (key === 'completeDuration') return row.completeDuration\n      if (key === 'created') return row.created\n      return row.kotId\n    },\n  )",
            content
        )

    # General rule for exportCsv downloadCsv replacement:
    content = re.sub(
        r'<<<<<<< HEAD\nimport \{ downloadCsv \} from \'\.\./\.\./utils/downloadFile\'\n=======\nimport \{ downloadCsv \} from \'\.\./\.\./utils/exportCsv\'\n>>>>>>> origin/main',
        "import { downloadCsv } from '../../utils/exportCsv'",
        content
    )

    # Fallback for remaining conflict markers:
    # If main has updated code, take main (or HEAD if main is empty)
    def resolve_block(match):
        head = match.group(1)
        main = match.group(2)
        # If head is empty or main is empty
        if not head.strip():
            return main
        if not main.strip():
            return head

        # If both have imports, combine unique lines
        head_lines = [l.strip() for l in head.splitlines() if l.strip()]
        main_lines = [l.strip() for l in main.splitlines() if l.strip()]
        if all(l.startswith('import') or l.startswith('export') for l in head_lines + main_lines):
            combined = []
            seen = set()
            for l in head.splitlines() + main.splitlines():
                if l not in seen:
                    seen.add(l)
                    combined.append(l)
            return '\n'.join(combined)

        # Default to main if main is active logic
        return main

    content = re.sub(r'<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> origin/main', resolve_block, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

count = 0
for root, dirs, filenames in os.walk('src'):
    for f in filenames:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.json')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fp:
                    if '<<<<<<<' in fp.read():
                        process_file(path)
                        count += 1
            except Exception as e:
                print(f'Error processing {path}: {e}')

print(f"Processed {count} files.")
