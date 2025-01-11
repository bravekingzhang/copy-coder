"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsControlProps {
  applicationType: string;
  temperature: number;
  onApplicationTypeChange: (value: string) => void;
  onTemperatureChange: (value: number) => void;
}

const SettingsControl = ({
  applicationType,
  temperature,
  onApplicationTypeChange,
  onTemperatureChange,
}: SettingsControlProps) => {
  return (
    <div className="mt-8 bg-white p-8 rounded-xl border border-gray-200">
      {/* Application Type Select */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Choose analysis focus:</h3>
        <Select value={applicationType} onValueChange={onApplicationTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select application type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web">Web applications</SelectItem>
            <SelectItem value="mobile">Mobile applications</SelectItem>
            <SelectItem value="desktop">Desktop applications</SelectItem>
          </SelectContent>
        </Select>
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