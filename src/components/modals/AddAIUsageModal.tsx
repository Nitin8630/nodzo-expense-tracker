import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AIServiceType, Currency } from '../../types/finance';
import { X, Cpu, Info } from 'lucide-react';

interface AddAIUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAIUsageModal: React.FC<AddAIUsageModalProps> = ({ isOpen, onClose }) => {
  const { customers, organization, addAIUsageRecord } = useFinance();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [provider, setProvider] = useState<'OpenAI' | 'Gemini' | 'Anthropic' | 'Modal' | 'Deepgram' | 'Supabase'>('OpenAI');
  const [model, setModel] = useState('gpt-4o-2024-08-06');
  const [serviceType, setServiceType] = useState<AIServiceType>('call_analysis');
  const [callsCount, setCallsCount] = useState<number>(1200);
  const [audioMinutes, setAudioMinutes] = useState<number>(0);
  const [tokensInput, setTokensInput] = useState<number>(3000000);
  const [tokensOutput, setTokensOutput] = useState<number>(600000);
  const [unitPrice, setUnitPrice] = useState<number>(0.0000025);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Compute estimated cost
  let estimatedCostUsd = 0;
  if (serviceType === 'speech_to_text') {
    estimatedCostUsd = audioMinutes * unitPrice; // e.g. $0.0043 / min
  } else if (serviceType === 'call_analysis' || serviceType === 'llm_api') {
    estimatedCostUsd = ((tokensInput * 0.0000025) + (tokensOutput * 0.000010));
  } else if (serviceType === 'gpu_inference') {
    estimatedCostUsd = audioMinutes * unitPrice;
  } else {
    estimatedCostUsd = 25.00;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCust = customers.find((c) => c.id === customerId);

    addAIUsageRecord({
      date,
      customerId: customerId || undefined,
      customerName: selectedCust ? selectedCust.companyName : undefined,
      provider,
      model,
      serviceType,
      callsCount,
      audioMinutes,
      tokensInput,
      tokensOutput,
      unitPrice,
      currency,
      estimatedCostUsd: Math.round(estimatedCostUsd * 100) / 100,
      isReconciled: false,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Log AI Pipeline Usage</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track speech-to-text, LLM calls, and GPU compute for customer calls.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-accent/20 border border-accent/40 rounded-lg flex items-start gap-2.5 text-accent-foreground text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <div>
            <span className="font-semibold">Financial Rule:</span> AI usage records are operational cost estimates. They are later matched with provider statements to eliminate double-counting.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Provider *</label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setProvider(p);
                  if (p === 'Deepgram') {
                    setModel('nova-2-general');
                    setServiceType('speech_to_text');
                    setUnitPrice(0.0043);
                  } else if (p === 'Modal') {
                    setModel('whisper-large-v3-turbo');
                    setServiceType('gpu_inference');
                    setUnitPrice(0.00062);
                  } else if (p === 'Anthropic') {
                    setModel('claude-3-5-sonnet-20241022');
                    setServiceType('call_analysis');
                  } else if (p === 'Gemini') {
                    setModel('gemini-1.5-pro');
                    setServiceType('llm_api');
                  } else {
                    setModel('gpt-4o-2024-08-06');
                    setServiceType('call_analysis');
                  }
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Deepgram">Deepgram</option>
                <option value="Modal">Modal GPU</option>
                <option value="Anthropic">Anthropic Claude</option>
                <option value="Gemini">Google Gemini</option>
                <option value="Supabase">Supabase</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Model / Architecture</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as AIServiceType)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="speech_to_text">Speech to Text</option>
                <option value="call_analysis">Call Analysis / LLM</option>
                <option value="gpu_inference">GPU Inference (Modal)</option>
                <option value="llm_api">API Prompt Processing</option>
                <option value="audio_storage">Audio & Embeddings Storage</option>
                <option value="data_transfer">Data Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Total Calls Processed</label>
              <input
                type="number"
                min="0"
                value={callsCount}
                onChange={(e) => setCallsCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Audio Minutes</label>
              <input
                type="number"
                min="0"
                step="any"
                value={audioMinutes}
                onChange={(e) => setAudioMinutes(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Log Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {(serviceType === 'call_analysis' || serviceType === 'llm_api') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
              <div>
                <label className="block text-muted-foreground mb-1">Input Tokens</label>
                <input
                  type="number"
                  min="0"
                  value={tokensInput}
                  onChange={(e) => setTokensInput(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Output Tokens</label>
                <input
                  type="number"
                  min="0"
                  value={tokensOutput}
                  onChange={(e) => setTokensOutput(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1 text-muted-foreground">Attribute to Customer (Optional)</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Shared / Platform Infrastructure --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-muted-foreground">Estimated Run Cost: </span>
              <span className="font-bold text-foreground">${estimatedCostUsd.toFixed(2)}</span>
            </div>
            <div className="text-muted-foreground">
              ₹{(estimatedCostUsd * organization.usdToInrRate).toFixed(0)} INR
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover font-medium shadow-subtle transition-colors"
            >
              Record Usage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
