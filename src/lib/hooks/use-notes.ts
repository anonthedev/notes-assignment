import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Note {
  uuid: string
  title: string
  notes: string
  email: string
  created_at: string
  updated_at: string
}

interface CreateNoteInput {
  notes: string
  title?: string
  email?: string
}

interface UpdateNoteInput extends CreateNoteInput {
  uuid: string
}

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await axios.get('/api/notes')
      return response.data as Note[]
    },
  })
}

export function useNote(uuid: string) {
  return useQuery({
    queryKey: ['notes', uuid],
    queryFn: async () => {
      const response = await axios.get(`/api/notes?uuid=${uuid}`)
      return response.data[0] as Note
    },
    enabled: !!uuid,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      const response = await axios({
        method: 'POST',
        url: '/api/notes',
        data: input,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      return response.data[0] as Note
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note created successfully')
    },
    onError: (error) => {
      console.error('Error creating note:', error)
      toast.error("Couldn't create note")
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ uuid, ...input }: UpdateNoteInput) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      const response = await axios({
        method: 'PUT',
        url: `/api/notes?uuid=${uuid}`,
        data: input,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      return response.data[0] as Note
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', data.uuid] })
      toast.success('Note updated successfully')
    },
    onError: (error) => {
      console.error('Error updating note:', error)
      toast.error("Couldn't update note")
    },
  })
}


export function useDeleteNote() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      await axios({
        method: 'DELETE',
        url: `/api/notes?uuid=${uuid}`,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      return uuid
    },
    onSuccess: (uuid) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.removeQueries({ queryKey: ['notes', uuid] })
      toast.success('Note deleted successfully')
    },
    onError: (error) => {
      console.error('Error deleting note:', error)
      toast.error("Couldn't delete note")
    },
  })
} 