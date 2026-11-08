import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

export function SettingsPanel({
  title,
  description,
  children,
  formId,
  footer,
  loading,
  saveLabel = 'Save changes',
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <div className="px-5 pb-5">{children}</div>
      {footer !== false && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <p className="text-[11px] text-slate-400">
            Changes are stored locally for this prototype.
          </p>
          <Button type="submit" form={formId} loading={loading}>
            {saveLabel}
          </Button>
        </div>
      )}
    </Card>
  )
}
