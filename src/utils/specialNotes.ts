import type { SpecialNote } from '../types/menu'

/**
 * Text a special note contributes to an order/line: its note text when set,
 * otherwise its title (most outlet notes are configured as title-only).
 */
export function specialNoteText(note: SpecialNote): string {
  return note.note_text.trim() || note.title
}

export function activeSpecialNotes(notes: SpecialNote[]): SpecialNote[] {
  return notes.filter((note) => note.is_active)
}

export function specialNoteOptions(notes: SpecialNote[]) {
  return activeSpecialNotes(notes).map((note) => ({
    value: note.id,
    label: note.title,
  }))
}

/** Id of the active note whose resolved text matches `text`, else ''. */
export function matchSpecialNoteId(notes: SpecialNote[], text: string): string {
  const match = activeSpecialNotes(notes).find(
    (note) => specialNoteText(note) === text,
  )
  return match?.id ?? ''
}
