export interface LogEntry {
  id: string
  date: string
  time: string
  callsign: string
  frequency: string
  mode: string
  rstSent: string
  rstReceived: string
  band: string
  power: string
  name?: string
  qth?: string
  notes?: string
}

export interface ColumnDefinition {
  id: keyof LogEntry
  label: string
  sortable: boolean
  visible: boolean
}
