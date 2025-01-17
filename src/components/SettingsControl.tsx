"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ApplicationFramework, FRAMEWORK_LABELS } from "@/types/application";

interface SettingsControlProps {
  applicationType: ApplicationFramework;
  temperature: number;
  codeWithImage: boolean;
  onApplicationTypeChange: (value: ApplicationFramework) => void;
  onTemperatureChange: (value: number) => void;
  onCodeWithImageChange: (value: boolean) => void;
}

const SettingsControl = ({
  applicationType,
  temperature,
  codeWithImage,
  onApplicationTypeChange,
  onTemperatureChange,
  onCodeWithImageChange,
}: SettingsControlProps) => {
  return (
    <div className="mt-8 bg-white p-8 rounded-xl border border-gray-200">
      {/* Application Type Select */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Choose technology stack:</h3>
        <Select value={applicationType} onValueChange={onApplicationTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select technology stack" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code with image */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Code with image:</h3>
        <Switch checked={codeWithImage} onCheckedChange={onCodeWithImageChange} />
        <p className="mt-2 text-xs text-gray-500">
          If the model supports it, you can switch it on to generate code with image. maybe it will be more accurate.
        </p>
      </div>

      {/* Temperature Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Temperature:</h3>
          <span className="text-sm text-gray-500">{temperature}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Precise</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-blue-700"
          />
          <span className="text-sm text-gray-500">Creative</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Adjust temperature to control the creativity level of the generated content.
          Lower values produce more focused results, while higher values increase creativity and variability.
        </p>
      </div>
    </div>
  );
};

export default SettingsControl;