'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { AddClientModal } from '@/components/add-client-modal'
import { ClientFilters } from '@/components/client-filters'
import { ClientsTable } from '@/components/clients-table'
import { Client } from '@/lib/types'
import { getClients, saveClient, deleteClient } from '@/lib/storage'
import { exportToExcel } from '@/lib/export'
import { UserPlus, Download, Users } from 'lucide-react'

export default function CRMDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    pol: '',
    projekat: '',
    kpi: '',
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setClients(getClients())
  }, [])

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (filters.pol && client.pol !== filters.pol) return false
      if (filters.projekat && client.projekat !== filters.projekat) return false
      if (filters.kpi && client.kpi !== filters.kpi) return false
      return true
    })
  }, [clients, filters])

  const handleSaveClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = saveClient(data)
    setClients((prev) => [...prev, newClient])
  }

  const handleDeleteClient = (id: string) => {
    deleteClient(id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({ pol: '', projekat: '', kpi: '' })
  }

  const handleExport = () => {
    exportToExcel(filteredClients, 'redi_klijenti')
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">REDI Srbija</h1>
              <p className="text-sm text-muted-foreground">CRM Platforma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport} disabled={filteredClients.length === 0}>
              <Download className="mr-2 size-4" />
              Export to Excel
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus className="mr-2 size-4" />
              Dodaj Klijenta
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Ukupno klijenata</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/10">
                <Users className="size-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clients.filter((c) => c.pol === 'M').length}
                </p>
                <p className="text-sm text-muted-foreground">Muski</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clients.filter((c) => c.pol === 'Ž').length}
                </p>
                <p className="text-sm text-muted-foreground">Zenski</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ClientFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results info */}
        {(filters.pol || filters.projekat || filters.kpi) && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Prikazano <span className="font-medium text-foreground">{filteredClients.length}</span> od{' '}
              <span className="font-medium text-foreground">{clients.length}</span> klijenata
            </p>
          </div>
        )}

        {/* Table */}
        <ClientsTable clients={filteredClients} onDelete={handleDeleteClient} />
      </main>

      {/* Add Client Modal */}
      <AddClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveClient}
      />
    </div>
  )
}
