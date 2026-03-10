'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveDraft, rejectDraft, updateDraft } from '@/actions/drafts'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { FileText, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface DraftActionsProps {
  draftId: string
  draftSubject: string
  draftBody: string
  draftImageUrl?: string | null
  draftImageAlt?: string | null
  draftImageCredit?: string | null
  status: string
}

export function DraftActions({ draftId, draftSubject, draftBody, draftImageUrl, draftImageAlt, draftImageCredit, status }: DraftActionsProps) {
  const router = useRouter()
  const [approving, setApproving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [subject, setSubject] = useState(draftSubject)
  const [body, setBody] = useState(draftBody)
  const [imageUrl, setImageUrl] = useState(draftImageUrl ?? '')
  const [imageAlt, setImageAlt] = useState(draftImageAlt ?? '')
  const [imageCredit, setImageCredit] = useState(draftImageCredit ?? '')
  const [rejectReason, setRejectReason] = useState('')

  const isPending = status === 'pending'

  async function handleApprove() {
    if (!confirm('Are you sure you want to approve and schedule this draft?')) return
    setApproving(true)
    const result = await approveDraft(draftId)
    if (result.success) {
      toast.success('Draft approved and scheduled')
      router.push('/approvals')
    } else {
      toast.error(result.error || 'Failed to approve draft')
    }
    setApproving(false)
  }

  async function handleSaveEdit() {
    setSaving(true)
    const formData = new FormData()
    formData.set('subject', subject)
    formData.set('body', body)
    formData.set('imageUrl', imageUrl)
    formData.set('imageAlt', imageAlt)
    formData.set('imageCredit', imageCredit)
    const result = await updateDraft(draftId, formData)
    if (result.success) {
      toast.success('Draft updated')
      setEditOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update draft')
    }
    setSaving(false)
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setRejecting(true)
    const result = await rejectDraft(draftId, rejectReason)
    if (result.success) {
      toast.success('Draft rejected')
      router.push('/approvals')
    } else {
      toast.error(result.error || 'Failed to reject draft')
    }
    setRejecting(false)
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 space-y-3">
        <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">
          Actions
        </h3>

        <div className="space-y-2">
          <Button
            className="w-full"
            variant="primary"
            size="md"
            onClick={handleApprove}
            disabled={!isPending || approving}
          >
            {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {approving ? 'Approving...' : 'Approve & Schedule'}
          </Button>

          <Button
            className="w-full"
            variant="secondary"
            size="md"
            onClick={() => setEditOpen(true)}
            disabled={!isPending}
          >
            <FileText className="w-4 h-4" />
            Edit Draft
          </Button>

          <div className="pt-2 border-t border-black/[0.07]">
            <label className="block text-[12px] text-gray-500 mb-1.5">
              Rejection reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejecting this draft..."
              className="w-full h-20 px-3 py-2 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg resize-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
              disabled={!isPending}
            />
            <Button
              className="w-full mt-2"
              variant="danger"
              size="md"
              onClick={handleReject}
              disabled={!isPending || rejecting}
            >
              {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {rejecting ? 'Rejecting...' : 'Reject Draft'}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Draft Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Draft"
        subtitle="Update the email subject and body"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveEdit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Body (HTML)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg font-mono resize-y placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
            />
          </div>

          {/* Hero Image Fields */}
          <div className="pt-3 border-t border-black/[0.07]">
            <p className="text-[12px] font-medium text-gray-500 mb-3">Hero Image</p>
            {imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={imageAlt} className="w-full max-h-[150px] object-cover" />
              </div>
            )}
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-8 px-3 text-[12px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Alt text</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description of the image"
                  className="w-full h-8 px-3 text-[12px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Credit</label>
                <input
                  type="text"
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  placeholder="Photo by Name on Unsplash"
                  className="w-full h-8 px-3 text-[12px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
