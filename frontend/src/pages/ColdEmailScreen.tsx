import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Mail, Copy, Loader2, AlertCircle, Sparkles, RotateCcw, Coins } from 'lucide-react';
import { useColdEmailGenerator } from '../hooks/useColdEmailGenerator';
import { toast } from 'sonner';
import type { ColdEmailRequest } from '../backend';
import { CoinPurchaseDialog } from '../components/CoinPurchaseDialog';

export default function ColdEmailScreen() {
  const { generateColdEmail, isGenerating, error, insufficientCoins } = useColdEmailGenerator();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  
  // Sender fields
  const [senderName, setSenderName] = useState('');
  const [senderCompany, setSenderCompany] = useState('');
  const [service, setService] = useState('');
  
  // Target fields
  const [targetName, setTargetName] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [industry, setIndustry] = useState('');
  
  // Selectable options
  const [goal, setGoal] = useState('book a meeting');
  const [tone, setTone] = useState('professional');
  const [emailLength, setEmailLength] = useState('medium');
  
  // Toggles (default ON)
  const [includeFollowUps, setIncludeFollowUps] = useState(true);
  const [includeSpamAnalysis, setIncludeSpamAnalysis] = useState(true);
  
  // Output
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!senderName.trim() || !senderCompany.trim() || !service.trim() || 
        !targetName.trim() || !targetCompany.trim() || !industry.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Map advanced fields to existing backend structure
    const personalization = `I'm ${senderName} from ${senderCompany}. I noticed your work at ${targetCompany} in the ${industry} industry.`;
    const subjectLine = `${goal === 'book a meeting' ? 'Quick Chat' : goal === 'sell service' ? 'Solution for' : goal === 'partnership' ? 'Partnership Opportunity with' : goal === 'job request' ? 'Opportunity at' : 'Demo of'} ${targetCompany}`;
    const productDetailsText = `${service} (Tone: ${tone}, Length: ${emailLength})`;
    const meetingRequestText = `Goal: ${goal}. ${includeFollowUps ? 'Include 2 follow-up emails (Day 3 & Day 7).' : ''} ${includeSpamAnalysis ? 'Include spam analysis and conversion insights.' : ''}`;

    const request: ColdEmailRequest = {
      recipient: targetName.trim(),
      subject: subjectLine,
      targetCompany: targetCompany.trim(),
      companySector: industry.trim(),
      useCase: service.trim(),
      personalization,
      productDetails: productDetailsText,
      meetingRequest: meetingRequestText,
    };

    const response = await generateColdEmail(request);
    if (response) {
      setGeneratedOutput(response.finalOutput);
      toast.success('Cold email generated successfully!');
    }
  };

  const handleCopy = async () => {
    if (!generatedOutput) return;

    try {
      await navigator.clipboard.writeText(generatedOutput);
      toast.success('Email copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy email');
    }
  };

  const handleReset = () => {
    setSenderName('');
    setSenderCompany('');
    setService('');
    setTargetName('');
    setTargetCompany('');
    setIndustry('');
    setGoal('book a meeting');
    setTone('professional');
    setEmailLength('medium');
    setIncludeFollowUps(true);
    setIncludeSpamAnalysis(true);
    setGeneratedOutput(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cold Email Generator</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Create high-converting cold emails with personalized follow-ups and spam analysis
            </p>
          </div>
        </div>
      </div>

      {/* Insufficient Coins Alert */}
      {insufficientCoins && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPurchaseDialogOpen(true)}
              className="flex-shrink-0"
            >
              <Coins className="h-4 w-4 mr-2" />
              Buy Coins
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Advanced Input Form */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Provide detailed information to generate a professional, high-converting cold email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Sender Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Your Name *</Label>
                <Input
                  id="senderName"
                  placeholder="e.g., John Doe"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderCompany">Your Company *</Label>
                <Input
                  id="senderCompany"
                  placeholder="e.g., TechCorp Inc."
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Your Service/Product *</Label>
              <Textarea
                id="service"
                placeholder="Describe what you offer and how it helps businesses..."
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={isGenerating}
                rows={3}
              />
            </div>
          </div>

          {/* Target Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Target Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetName">Recipient Name *</Label>
                <Input
                  id="targetName"
                  placeholder="e.g., Jane Smith"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetCompany">Target Company *</Label>
                <Input
                  id="targetCompany"
                  placeholder="e.g., Acme Corp"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry/Sector *</Label>
              <Input
                id="industry"
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Email Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Email Options</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Select value={goal} onValueChange={setGoal} disabled={isGenerating}>
                  <SelectTrigger id="goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book a meeting">Book a Meeting</SelectItem>
                    <SelectItem value="sell service">Sell Service</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="job request">Job Request</SelectItem>
                    <SelectItem value="demo">Request Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailLength">Length</Label>
                <Select value={emailLength} onValueChange={setEmailLength} disabled={isGenerating}>
                  <SelectTrigger id="emailLength">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Advanced Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="followUps" className="text-sm font-medium">
                    Include Follow-Up Emails
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Generate 2 follow-up emails (Day 3 & Day 7)
                  </p>
                </div>
                <Switch
                  id="followUps"
                  checked={includeFollowUps}
                  onCheckedChange={setIncludeFollowUps}
                  disabled={isGenerating}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="spamAnalysis" className="text-sm font-medium">
                    Spam Risk Analysis
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include spam filter compliance check and conversion insights
                  </p>
                </div>
                <Switch
                  id="spamAnalysis"
                  checked={includeSpamAnalysis}
                  onCheckedChange={setIncludeSpamAnalysis}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Cold Email
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isGenerating}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Output */}
      {generatedOutput && (
        <Card className="shadow-sm border-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Generated Cold Email</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {generatedOutput}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Coin Purchase Dialog */}
      <CoinPurchaseDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen} />
    </div>
  );
}
