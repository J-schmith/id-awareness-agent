import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default async function ImportSubscribersPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/subscribers"
        className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Subscribers
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Import Subscribers</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a CSV file to bulk-import subscribers
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-8">
        <div className="border-2 border-dashed border-black/[0.1] rounded-xl p-12 flex flex-col items-center justify-center hover:border-[#0071e3]/30 hover:bg-[#0071e3]/[0.02] transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-[14px] font-medium text-gray-700 mb-1">
            Drop your CSV file here, or click to browse
          </p>
          <p className="text-[12px] text-gray-400">
            Supports .csv files up to 5 MB
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <span className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-black/[0.06] text-sm font-medium text-gray-700 cursor-pointer hover:bg-black/[0.1] transition-colors">
              Choose File
            </span>
          </label>
        </div>

        {/* Format hint */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-black/[0.05]">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-gray-700 mb-1">
                Expected CSV format
              </p>
              <div className="bg-white rounded-lg border border-black/[0.07] p-3 font-mono text-[12px] text-gray-600">
                <p className="text-gray-400">email,name,segments</p>
                <p>jane@company.com,Jane Doe,London;Engineering</p>
                <p>alex@company.com,Alex Smith,NYC;Marketing;ERG Lead</p>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Segments should be separated by semicolons. The email column is required; name and segments are optional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area (shown after file is parsed) */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-6">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
          Preview
        </h3>

        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <AlertCircle className="w-8 h-8 mb-2 text-gray-300" />
          <p className="text-[13px] font-medium">No file selected</p>
          <p className="text-[12px] mt-0.5">
            Upload a CSV above to preview rows before importing
          </p>
        </div>
      </div>

      {/* Import Action */}
      <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm">
        <div>
          <p className="text-[13px] text-gray-500">
            Rows will be validated before import. Duplicates are skipped.
          </p>
        </div>
        <Button variant="primary" size="md" disabled>
          <Upload className="w-4 h-4" />
          Import Subscribers
        </Button>
      </div>
    </div>
  )
}
