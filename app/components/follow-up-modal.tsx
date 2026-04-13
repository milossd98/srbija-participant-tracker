'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { ClientModal } from '@/components/client-modal'
import { FollowUpModal } from '@/components/follow-up-modal'
import { ClientFilters } from '@/components/client-filters'
import { ClientsTable } from '@/components/clients-table'
import { Client, FollowUp } from '@/lib/types'
import { getClients, saveClient, updateClient, deleteClient, isFollowUpNeeded } from '@/lib/storage'
import { exportToExcel } from '@/lib/export'
import { UserPlus, Download, Users, AlertTriangle } from 'lucide-react'

export default function CRMDashboard() {
  const { data: clients = [], mutate, isLoading } = useSWR('clients', getClients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [followUpClient, setFollowUpClient] = useState<Client | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState({
    pol: '',
    projekat: '',
    kpi: '',
  })

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (filters.pol && client.pol !== filters.pol) return false
      if (filters.projekat && client.projekat !== filters.projekat) return false
      if (filters.kpi && client.kpi !== filters.kpi) return false
      return true
    })
  }, [clients, filters])

  const needsFollowUpCount = useMemo(() => {
    return clients.filter((c) => isFollowUpNeeded(c.poslednjiKontakt)).length
  }, [clients])

  const handleSaveClient = async (data: Omit<Client, 'id' | 'createdAt'>) => {
    setIsSaving(true)
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data)
      } else {
        await saveClient(data)
      }
      await mutate()
      setEditingClient(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id)
    await mutate()
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleFollowUp = (client: Client) => {
    setFollowUpClient(client)
    setIsFollowUpModalOpen(true)
  }

  const handleSaveFollowUp = async (clientId: string, followUp: FollowUp) => {
    setIsSaving(true)
    try {
      const client = clients.find((c) => c.id === clientId)
      if (!client) return

      const updatedFollowUps = [...(client.followUps || []), followUp]
      const updatedDriveLinks = followUp.driveLink
        ? [...(client.driveLinks || []), followUp.driveLink]
        : client.driveLinks

      await updateClient(clientId, {
        followUps: updatedFollowUps,
        driveLinks: updatedDriveLinks,
        poslednjiKontakt: new Date().toISOString().split('T')[0],
      })
      await mutate()
    } finally {
      setIsSaving(false)
    }
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

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setEditingClient(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
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
          <div className={`rounded-lg border p-4 ${needsFollowUpCount > 0 ? 'border-yellow-400 bg-yellow-50' : 'border-border bg-card'}`}>
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-lg ${needsFollowUpCount > 0 ? 'bg-yellow-200' : 'bg-muted'}`}>
                <AlertTriangle className={`size-5 ${needsFollowUpCount > 0 ? 'text-yellow-700' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${needsFollowUpCount > 0 ? 'text-yellow-800' : 'text-foreground'}`}>
                  {needsFollowUpCount}
                </p>
                <p className={`text-sm ${needsFollowUpCount > 0 ? 'text-yellow-700' : 'text-muted-foreground'}`}>
                  Potreban follow-up
                </p>
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
        <ClientsTable
          clients={filteredClients}
          onDelete={handleDeleteClient}
          onEdit={handleEditClient}
          onFollowUp={handleFollowUp}
        />
      </main>

      {/* Add/Edit Client Modal */}
      <ClientModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSave={handleSaveClient}
        editClient={editingClient}
        isSaving={isSaving}
      />

      {/* Follow-up Modal */}
      <FollowUpModal
        open={isFollowUpModalOpen}
        onOpenChange={setIsFollowUpModalOpen}
        client={followUpClient}
        onSave={handleSaveFollowUp}
        isSaving={isSaving}
      />
    </div>
  )
}
