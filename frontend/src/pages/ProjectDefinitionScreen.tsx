import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ProjectDefinition {
  goal: string;
  targetUsers: string;
  keyFeatures: string;
  constraints: string;
}

function ProjectDefinitionScreen() {
  const [formData, setFormData] = useState<ProjectDefinition>({
    goal: '',
    targetUsers: '',
    keyFeatures: '',
    constraints: '',
  });

  const [showSummary, setShowSummary] = useState(false);

  const handleInputChange = (field: keyof ProjectDefinition, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const handleReset = () => {
    setFormData({
      goal: '',
      targetUsers: '',
      keyFeatures: '',
      constraints: '',
    });
    setShowSummary(false);
  };

  const isFormValid = formData.goal.trim() && formData.targetUsers.trim();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Project Definition Wizard</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
          Define Your Project Requirements
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Tell us about your project goals, target audience, and key features. We'll help you structure your requirements.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Form Card */}
        <Card className="shadow-sm border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Project Details
            </CardTitle>
            <CardDescription>
              Fill in the details about your project. Required fields are marked with an asterisk (*).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* App Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-base font-medium">
                  App Goal <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="goal"
                  placeholder="What is the main purpose of your application? What problem does it solve?"
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              {/* Target Users */}
              <div className="space-y-2">
                <Label htmlFor="targetUsers" className="text-base font-medium">
                  Target Users <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="targetUsers"
                  placeholder="Who will use this application? (e.g., developers, designers, students)"
                  value={formData.targetUsers}
                  onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                  required
                />
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <Label htmlFor="keyFeatures" className="text-base font-medium">
                  Key Features
                </Label>
                <Textarea
                  id="keyFeatures"
                  placeholder="List the main features you want to include (one per line or comma-separated)"
                  value={formData.keyFeatures}
                  onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Constraints */}
              <div className="space-y-2">
                <Label htmlFor="constraints" className="text-base font-medium">
                  Constraints & Requirements
                </Label>
                <Textarea
                  id="constraints"
                  placeholder="Any technical constraints, budget limits, or specific requirements?"
                  value={formData.constraints}
                  onChange={(e) => handleInputChange('constraints', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-11"
                  disabled={!isFormValid}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-11"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className={`shadow-sm border-2 transition-all duration-300 ${showSummary ? 'border-primary/50 bg-primary/5' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Requirements Summary
            </CardTitle>
            <CardDescription>
              {showSummary
                ? 'Here\'s a structured overview of your project requirements'
                : 'Submit the form to see your structured requirements summary'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSummary ? (
              <div className="space-y-6">
                {/* Goal Section */}
                {formData.goal && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="rounded">
                        Goal
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed pl-1">
                      {formData.goal}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Target Users Section */}
                {formData.targetUsers && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded">
                        Target Users
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed pl-1">
                      {formData.targetUsers}
                    </p>
                  </div>
                )}

                {/* Key Features Section */}
                {formData.keyFeatures && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded">
                          Key Features
                        </Badge>
                      </div>
                      <div className="text-sm leading-relaxed pl-1">
                        {formData.keyFeatures.split(/[,\n]/).filter(f => f.trim()).length > 1 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {formData.keyFeatures
                              .split(/[,\n]/)
                              .filter((feature) => feature.trim())
                              .map((feature, index) => (
                                <li key={index}>{feature.trim()}</li>
                              ))}
                          </ul>
                        ) : (
                          <p>{formData.keyFeatures}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Constraints Section */}
                {formData.constraints && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded">
                          Constraints
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed pl-1">
                        {formData.constraints}
                      </p>
                    </div>
                  </>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear & Start Over
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Fill out the project details form and click "Generate Summary" to see your structured requirements here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProjectDefinitionScreen;
