import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Clock, Loader2, AlertCircle, Check, Replace, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGenerateServiceOrder } from "@/hooks/useGenerateServiceOrder";
import type { ProgramSegment, ServiceInfo } from "@/types";
import { formatTimeRange, calculateEndTime } from "@/utils/timeUtils";

interface AutoGenerateFormProps {
  onApplySegments: (
    segments: ProgramSegment[],
    serviceInfo?: ServiceInfo,
    mode?: "replace" | "append"
  ) => void;
  existingSegmentsCount: number;
}

const PLACEHOLDER_TEXT = `Paste your service order text here. Example:

*Second Service - Sunday, 22nd of February, 2026*

1. Worship Session (10:10am - 10:20am)
2. Bible Reading 5 Minutes (10:20am - 10:25am) John Doe
3. Announcements 7 Minutes (10:25am - 10:32am) Jane Smith
4. Special Song 5 Mins (10:32am - 10:37am) Choir
5. WORD 60 Minutes (10:37am - 11:37am) Pastor
6. Offering 10 Minutes (11:37am - 11:47am)
7. Closing 5 Minutes (11:47am - 11:52am)`;

export default function AutoGenerateForm({
  onApplySegments,
  existingSegmentsCount,
}: AutoGenerateFormProps) {
  const [inputText, setInputText] = useState("");
  const [generatedSegments, setGeneratedSegments] = useState<ProgramSegment[]>([]);
  const [generatedServiceInfo, setGeneratedServiceInfo] = useState<ServiceInfo | undefined>();
  const { generate, isLoading, error, clearError } = useGenerateServiceOrder();

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    clearError();
    const result = await generate(inputText);

    if (result) {
      setGeneratedSegments(result.segments);
      if (result.serviceInfo) {
        setGeneratedServiceInfo({
          title: result.serviceInfo.title,
          serviceDate: result.serviceInfo.serviceDate,
          serviceTime: result.serviceInfo.serviceTime,
        });
      }
    }
  };

  const handleApply = (mode: "replace" | "append") => {
    onApplySegments(generatedSegments, generatedServiceInfo, mode);
    // Clear the form after applying
    setInputText("");
    setGeneratedSegments([]);
    setGeneratedServiceInfo(undefined);
  };

  const hasGeneratedContent = generatedSegments.length > 0;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Auto Generate
            </CardTitle>
            <CardDescription>
              Paste your service order text and let AI parse it into segments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceOrderText">Service Order Text</Label>
              <Textarea
                id="serviceOrderText"
                placeholder={PLACEHOLDER_TEXT}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Segments
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Preview Card */}
      <AnimatePresence>
        {hasGeneratedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Generated Preview
                </CardTitle>
                <CardDescription>
                  {generatedSegments.length} segment{generatedSegments.length !== 1 ? "s" : ""} parsed
                  {generatedServiceInfo && (
                    <span className="block mt-1">
                      Service: {generatedServiceInfo.title} on {generatedServiceInfo.serviceDate}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Segments List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {generatedSegments.map((segment, index) => (
                    <motion.div
                      key={segment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {segment.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTimeRange(
                              segment.startTime,
                              calculateEndTime(segment.startTime, segment.duration)
                            )}
                          </span>
                          <span className="text-muted-foreground/60">
                            ({segment.duration} min)
                          </span>
                        </div>
                        {segment.personAssigned && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {segment.personAssigned}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {existingSegmentsCount > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleApply("append")}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Append
                      </Button>
                      <Button
                        onClick={() => handleApply("replace")}
                        className="flex-1"
                      >
                        <Replace className="h-4 w-4 mr-2" />
                        Replace All
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleApply("replace")}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply Segments
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
