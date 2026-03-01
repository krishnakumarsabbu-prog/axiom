import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperimentStore, useTenantStore } from '../../stores';
import { Button, Spinner } from '../../components/ui';
import { Step1BasicInfo } from './wizard/Step1BasicInfo';
import { Step2Endpoints } from './wizard/Step2Endpoints';
import { Step3ProxySettings } from './wizard/Step3ProxySettings';
import { Step4Review } from './wizard/Step4Review';
import { initialFormState } from './wizard/types';
import type { WizardFormState } from './wizard/types';
import type { CreateExperiment } from '../../domain';
import { EndpointConfigSchema } from '../../domain';

const STEPS = ['Basic Info', 'Endpoints', 'Proxy Settings', 'Review'];

function validateStep(step: number, form: WizardFormState): Record<string, string> {
  const errs: Record<string, string> = {};

  if (step === 0) {
    if (!form.name.trim()) errs.name = 'Name is required';
  }

  if (step === 1) {
    if (form.type === 'AB') {
      const aResult = EndpointConfigSchema.safeParse(form.variantA);
      if (!aResult.success) {
        aResult.error.issues.forEach(i => { errs[`variantA.${String(i.path[0])}`] = i.message; });
      }
      const bResult = EndpointConfigSchema.safeParse(form.variantB);
      if (!bResult.success) {
        bResult.error.issues.forEach(i => { errs[`variantB.${String(i.path[0])}`] = i.message; });
      }
      if (form.splitA + form.splitB !== 100) {
        errs.splitA = 'Split percentages must sum to 100';
      }
    } else {
      const cResult = EndpointConfigSchema.safeParse(form.champion);
      if (!cResult.success) {
        cResult.error.issues.forEach(i => { errs[`champion.${String(i.path[0])}`] = i.message; });
      }
      const chResult = EndpointConfigSchema.safeParse(form.challenger);
      if (!chResult.success) {
        chResult.error.issues.forEach(i => { errs[`challenger.${String(i.path[0])}`] = i.message; });
      }
    }
  }

  if (step === 2) {
    if (!form.correlationIdHeaderName.trim()) {
      errs.correlationIdHeaderName = 'Correlation ID header name is required';
    }
    if (form.type === 'AB' && !form.bucketingKeyValue.trim()) {
      errs.bucketingKeyValue = 'Bucketing key is required';
    }
  }

  return errs;
}

function buildCreatePayload(form: WizardFormState): CreateExperiment {
  const base = {
    name: form.name,
    description: form.description || undefined,
    type: form.type,
    correlationIdHeaderName: form.correlationIdHeaderName,
  };

  if (form.type === 'AB') {
    return {
      ...base,
      type: 'AB' as const,
      abConfig: {
        variantA: form.variantA,
        variantB: form.variantB,
        splitA: form.splitA,
        splitB: form.splitB,
        bucketingKeySource: form.bucketingKeySource,
        bucketingKeyValue: form.bucketingKeyValue,
      },
    };
  }

  return {
    ...base,
    type: 'CC' as const,
    ccConfig: {
      champion: form.champion,
      challenger: form.challenger,
      executionMode: form.executionMode,
    },
  };
}

export const ExperimentNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { createExperiment, isCreating } = useExperimentStore();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardFormState>(initialFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (updates: Partial<WizardFormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleCreate = async () => {
    if (!currentTenant) return;
    try {
      const payload = buildCreatePayload(form);
      const detail = await createExperiment(currentTenant.id, payload);
      navigate(`/app/experiments/${detail.id}`);
    } catch {
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/app/experiments')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Experiments
        </button>
        <h1 className="text-3xl font-display font-bold text-foreground">New Experiment</h1>
        <p className="text-muted-foreground mt-1">Configure a new A/B test or Champion/Challenger experiment</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors ${
                    idx < step
                      ? 'bg-foreground text-primary-foreground border-foreground'
                      : idx === step
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-border'
                  }`}
                >
                  {idx < step ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs mt-1.5 ${idx === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px mb-5 mx-2 ${idx < step ? 'bg-foreground/30' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[var(--radius)] p-6 mb-6">
        {step === 0 && <Step1BasicInfo form={form} errors={errors} onChange={updateForm} />}
        {step === 1 && <Step2Endpoints form={form} errors={errors} onChange={updateForm} />}
        {step === 2 && <Step3ProxySettings form={form} errors={errors} onChange={updateForm} />}
        {step === 3 && <Step4Review form={form} />}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={step === 0 ? () => navigate('/app/experiments') : handleBack}
          disabled={isCreating}
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </Button>
        <Button
          variant="primary"
          onClick={isLastStep ? handleCreate : handleNext}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Spinner size="sm" />
              Creating...
            </>
          ) : isLastStep ? (
            'Create Experiment'
          ) : (
            'Continue →'
          )}
        </Button>
      </div>
    </div>
  );
};
