import { Button } from '@/components/ui/button'
import { Settings, Mail, Bot, Bell, Lock, Save } from 'lucide-react'

function maskKey(key: string | undefined): string {
  if (!key) return 'Not configured'
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

export default async function SettingsPage() {
  // Read env values server-side (masked for display)
  const envValues = {
    anthropicKey: maskKey(process.env.ANTHROPIC_API_KEY),
    awsAccessKey: maskKey(process.env.AWS_ACCESS_KEY_ID),
    awsSecretKey: maskKey(process.env.AWS_SECRET_ACCESS_KEY),
    awsRegion: process.env.AWS_REGION ?? 'eu-west-1',
    sesFromEmail: process.env.SES_FROM_EMAIL ?? 'Not configured',
    databaseUrl: process.env.DATABASE_URL
      ? 'file:' + process.env.DATABASE_URL.replace(/^file:/, '').slice(0, 20) + '...'
      : 'Not configured',
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure the I&D Awareness Agent &mdash; Phase 4+
        </p>
      </div>

      {/* Email Configuration */}
      <section className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              Email Configuration
            </h3>
            <p className="text-[12px] text-gray-400">
              Amazon SES settings for sending awareness emails
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              AWS Access Key ID
            </label>
            <div className="flex items-center h-9 px-3 bg-gray-50 border border-black/[0.07] rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <span className="text-[13px] font-mono text-gray-500">
                {envValues.awsAccessKey}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              AWS Secret Access Key
            </label>
            <div className="flex items-center h-9 px-3 bg-gray-50 border border-black/[0.07] rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <span className="text-[13px] font-mono text-gray-500">
                {envValues.awsSecretKey}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              AWS Region
            </label>
            <input
              type="text"
              defaultValue={envValues.awsRegion}
              disabled
              className="w-full h-9 px-3 text-[13px] text-gray-500 bg-gray-50 border border-black/[0.07] rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              From Email Address
            </label>
            <input
              type="text"
              defaultValue={envValues.sesFromEmail}
              disabled
              className="w-full h-9 px-3 text-[13px] text-gray-500 bg-gray-50 border border-black/[0.07] rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Agent Configuration */}
      <section className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              Agent Configuration
            </h3>
            <p className="text-[12px] text-gray-400">
              AI agent behaviour and scheduling settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Anthropic API Key
            </label>
            <div className="flex items-center h-9 px-3 bg-gray-50 border border-black/[0.07] rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <span className="text-[13px] font-mono text-gray-500">
                {envValues.anthropicKey}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Default Tone
            </label>
            <select
              disabled
              defaultValue="professional"
              className="w-full h-9 px-3 text-[13px] text-gray-500 bg-gray-50 border border-black/[0.07] rounded-lg appearance-none"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="empathetic">Empathetic</option>
              <option value="inspiring">Inspiring</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Research Frequency
            </label>
            <select
              disabled
              defaultValue="weekly"
              className="w-full h-9 px-3 text-[13px] text-gray-500 bg-gray-50 border border-black/[0.07] rounded-lg appearance-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Draft Lead Time (days)
            </label>
            <input
              type="number"
              defaultValue={14}
              disabled
              className="w-full h-9 px-3 text-[13px] text-gray-500 bg-gray-50 border border-black/[0.07] rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              Notification Preferences
            </h3>
            <p className="text-[12px] text-gray-400">
              Choose when and how to be notified
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              label: 'New draft ready for review',
              description: 'Get notified when the agent creates a new message draft',
              defaultChecked: true,
            },
            {
              label: 'Awareness day approaching',
              description: 'Reminder 7 days before an upcoming awareness day',
              defaultChecked: true,
            },
            {
              label: 'Send confirmation',
              description: 'Confirmation after an email has been sent to subscribers',
              defaultChecked: true,
            },
            {
              label: 'Agent error alerts',
              description: 'Be alerted if the agent encounters an error during research or drafting',
              defaultChecked: false,
            },
          ].map((pref) => (
            <label
              key={pref.label}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked={pref.defaultChecked}
                disabled
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]/20"
              />
              <div>
                <p className="text-[13px] font-medium text-gray-700">
                  {pref.label}
                </p>
                <p className="text-[12px] text-gray-400">{pref.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Save bar */}
      <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm">
        <p className="text-[13px] text-gray-400">
          Settings are read-only in the current phase. Editing will be available in Phase 4+.
        </p>
        <Button variant="primary" size="md" disabled>
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
