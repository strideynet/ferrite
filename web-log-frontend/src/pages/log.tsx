import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronUp, ChevronsUpDown, Settings2, Search } from 'lucide-react'
import type { LogEntry, ColumnDefinition } from '@/types/log'

// Sample data for demonstration
const sampleData: LogEntry[] = [
  {
    id: '1',
    date: '2025-10-10',
    time: '14:30',
    callsign: 'W1AW',
    frequency: '14.250',
    mode: 'SSB',
    rstSent: '59',
    rstReceived: '59',
    band: '20m',
    power: '100W',
    name: 'John',
    qth: 'Hartford, CT',
    notes: 'Strong signal',
  },
  {
    id: '2',
    date: '2025-10-10',
    time: '15:45',
    callsign: 'G3XYZ',
    frequency: '7.088',
    mode: 'CW',
    rstSent: '599',
    rstReceived: '579',
    band: '40m',
    power: '50W',
    name: 'David',
    qth: 'London, UK',
    notes: 'QSB present',
  },
  {
    id: '3',
    date: '2025-10-09',
    time: '18:20',
    callsign: 'JA1ABC',
    frequency: '21.074',
    mode: 'FT8',
    rstSent: '-12',
    rstReceived: '-08',
    band: '15m',
    power: '25W',
    name: 'Hiroshi',
    qth: 'Tokyo, Japan',
    notes: 'Long path',
  },
  {
    id: '4',
    date: '2025-10-09',
    time: '12:00',
    callsign: 'VK2ABC',
    frequency: '28.500',
    mode: 'SSB',
    rstSent: '57',
    rstReceived: '55',
    band: '10m',
    power: '100W',
    name: 'Michael',
    qth: 'Sydney, Australia',
  },
  {
    id: '5',
    date: '2025-10-08',
    time: '20:15',
    callsign: 'DL1XYZ',
    frequency: '3.550',
    mode: 'CW',
    rstSent: '579',
    rstReceived: '599',
    band: '80m',
    power: '100W',
    name: 'Klaus',
    qth: 'Munich, Germany',
    notes: 'Nice CW operator',
  },
]

const defaultColumns: ColumnDefinition[] = [
  { id: 'date', label: 'Date', sortable: true, visible: true },
  { id: 'time', label: 'Time (UTC)', sortable: true, visible: true },
  { id: 'callsign', label: 'Callsign', sortable: true, visible: true },
  { id: 'frequency', label: 'Frequency (MHz)', sortable: true, visible: true },
  { id: 'mode', label: 'Mode', sortable: true, visible: true },
  { id: 'rstSent', label: 'RST Sent', sortable: true, visible: true },
  { id: 'rstReceived', label: 'RST Rcvd', sortable: true, visible: true },
  { id: 'band', label: 'Band', sortable: true, visible: true },
  { id: 'power', label: 'Power', sortable: true, visible: true },
  { id: 'name', label: 'Name', sortable: true, visible: false },
  { id: 'qth', label: 'QTH', sortable: true, visible: false },
  { id: 'notes', label: 'Notes', sortable: false, visible: false },
]

type SortDirection = 'asc' | 'desc' | null

export function Log() {
  const [columns, setColumns] = useState<ColumnDefinition[]>(defaultColumns)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof LogEntry | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId: keyof LogEntry) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  // Handle sorting
  const handleSort = (columnId: keyof LogEntry) => {
    if (sortColumn === columnId) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...sampleData]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((entry) =>
        Object.values(entry).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      )
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = String(a[sortColumn])
        const bVal = String(b[sortColumn])

        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true })
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [searchQuery, sortColumn, sortDirection])

  // Get visible columns
  const visibleColumns = columns.filter((col) => col.visible)

  // Render sort icon
  const renderSortIcon = (columnId: keyof LogEntry) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-2 h-4 w-4" />
    }
    return <ChevronDown className="ml-2 h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logbook</h1>
          <p className="text-muted-foreground mt-1">
            {filteredAndSortedData.length} contact{filteredAndSortedData.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>Add Contact</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search callsign, name, QTH, notes..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center font-medium hover:text-foreground"
                    >
                      {column.label}
                      {renderSortIcon(column.id)}
                    </button>
                  ) : (
                    <span className="font-medium">{column.label}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  {searchQuery ? 'No contacts found matching your search.' : 'No contacts in logbook.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((entry) => (
                <TableRow key={entry.id}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      {entry[column.id] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
