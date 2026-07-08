import HetTable from '../../../styles/HetComponents/HetTable'

interface StripedTableProps {
  rows: Record<string, any>[]
  columns: { header: string; accessor: string }[]
  id?: string
  applyThickBorder?: boolean
}

export default function StripedTable({
  rows,
  columns,
  id,
  applyThickBorder,
}: StripedTableProps) {
  const hetColumns = columns.map((col) => ({
    key: col.accessor,
    header: col.header,
  }))

  const hetRows = rows.map((row) =>
    Object.fromEntries(
      columns.map((col) => [col.accessor, row[col.accessor] ?? null]),
    ),
  )

  return (
    <HetTable
      rows={hetRows}
      columns={hetColumns}
      id={id}
      applyThickBorder={applyThickBorder}
      variant='methodology'
    />
  )
}
