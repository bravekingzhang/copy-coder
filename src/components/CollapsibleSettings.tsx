import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import SettingsControl from "@/components/SettingsControl"
import { ApplicationFramework } from "@/types/application"
interface CollapsibleSettingsProps {
  applicationType: ApplicationFramework
  temperature: number
  codeWithImage: boolean
  onApplicationTypeChange: (value: ApplicationFramework) => void
  onTemperatureChange: (value: number) => void
  onCodeWithImageChange: (value: boolean) => void
}

export default function CollapsibleSettings({
  applicationType,
  temperature,
  codeWithImage,
  onApplicationTypeChange,
  onTemperatureChange,
  onCodeWithImageChange,
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
            codeWithImage={codeWithImage}
            onApplicationTypeChange={onApplicationTypeChange}
            onTemperatureChange={onTemperatureChange}
            onCodeWithImageChange={onCodeWithImageChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}