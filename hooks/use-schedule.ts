import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'

type StudyBlock = Database['public']['Tables']['study_blocks']['Row']

async function fetchSchedule() {
  const res = await fetch('/api/schedule')
  if (!res.ok) throw new Error('Failed to fetch schedule')
  const json = (await res.json()) as { blocks?: unknown }
  return Array.isArray(json.blocks) ? (json.blocks as StudyBlock[]) : []
}

export function useSchedule() {
  return useQuery({
    queryKey: ['schedule'],
    queryFn: fetchSchedule,
  })
}

export function useGenerateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (date?: string) => {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (!res.ok) throw new Error('Failed to generate schedule')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule'] }),
  })
}

export function useUpdateBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<StudyBlock> & { id: string }) => {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update block')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule'] }),
  })
}
