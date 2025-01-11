import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import SettingsControl from "@/components/SettingsControl"
import { Settings } from "lucide-react"

interface CollapsibleSettingsProps {
  applicationType: string
  temperature: number
  onApplicationTypeChange: (value: string) => void
  onTemperatureChange: (value: number) => void
}

export default function CollapsibleSettings({
  applicationType,
  temperature,
  onApplicationTypeChange,
  onTemperatureChange,
}: CollapsibleSettingsProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="settings">
        <AccordionTrigger className="flex gap-2">
          <span>Generation Settings</span>
          <span className="text-xs text-muted-foreground ml-2">
            (Click to configure)
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <SettingsControl
            applicationType={applicationType}
            temperature={temperature}
            onApplicationTypeChange={onApplicationTypeChange}
            onTemperatureChange={onTemperatureChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}