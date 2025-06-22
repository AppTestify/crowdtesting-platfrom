import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { refineDescriptionService } from '@/app/_services/ai.service';
import toasterService from '@/app/_services/toaster-service';
import { Separator } from '@/components/ui/separator';

interface AIRefinementProps {
  currentDescription: string;
  onApplyRefinement: (refinedDescription: string) => void;
  context?: string;
  trigger?: React.ReactNode;
}

const AIRefinement: React.FC<AIRefinementProps> = ({
  currentDescription,
  onApplyRefinement,
  context,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedDescription, setRefinedDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRefine = async () => {
    if (!currentDescription.trim()) {
      toasterService.error('Please enter a description first');
      return;
    }

    setIsRefining(true);
    try {
      const response = await refineDescriptionService(currentDescription, context);
      setOriginalDescription(response.originalDescription);
      setRefinedDescription(response.refinedDescription);
      toasterService.success('Description refined successfully!');
    } catch (error) {
      toasterService.error('Failed to refine description. Please try again.');
      console.error('Refinement error:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleApply = () => {
    onApplyRefinement(refinedDescription);
    setIsOpen(false);
    setRefinedDescription('');
    setOriginalDescription('');
    toasterService.success('Refined description applied!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refinedDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toasterService.success('Copied to clipboard!');
    } catch (error) {
      toasterService.error('Failed to copy to clipboard');
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    setRefinedDescription('');
    setOriginalDescription('');
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpenDialog} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <Sparkles className="h-4 w-4" />
          Refine with AI
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              AI Description Refinement
            </DialogTitle>
            <DialogDescription>
              Use AI to improve your requirement description with better structure, clarity, and professional formatting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">Current Description</h4>
                <Badge variant="outline" className="text-xs">Original</Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: currentDescription || 'No description provided' }}
                />
              </div>
            </div>

            {/* Refine Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleRefine}
                disabled={isRefining || !currentDescription.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refining with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Refine with AI
                  </>
                )}
              </Button>
            </div>

            {/* Refined Description */}
            {refinedDescription && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">AI Refined Description</h4>
                      <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Enhanced
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div 
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: refinedDescription }}
                    />
                  </div>

                  {/* Improvement Highlights */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">AI Improvements Applied:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Enhanced structure and formatting</li>
                      <li>• Added clear acceptance criteria</li>
                      <li>• Improved professional tone</li>
                      <li>• Organized content with headings</li>
                      <li>• Added implementation notes</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {refinedDescription && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefine}
                  disabled={isRefining}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refine Again
                </Button>
              )}
              
              <Button
                onClick={handleApply}
                disabled={!refinedDescription}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Apply Refined Description
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIRefinement; 