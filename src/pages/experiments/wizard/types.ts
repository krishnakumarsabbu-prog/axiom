import type { EndpointConfig } from '../../../domain';

export interface WizardFormState {
  name: string;
  description: string;
  type: 'AB' | 'CC';

  variantA: EndpointConfig;
  variantB: EndpointConfig;
  splitA: number;
  splitB: number;
  bucketingKeySource: 'header' | 'jsonpath';
  bucketingKeyValue: string;

  champion: EndpointConfig;
  challenger: EndpointConfig;
  executionMode: 'parallel' | 'sequential';

  correlationIdHeaderName: string;
}

export const defaultEndpoint = (): EndpointConfig => ({
  url: '',
  method: 'POST',
  headers: [],
  timeoutMs: 5000,
});

export const initialFormState = (): WizardFormState => ({
  name: '',
  description: '',
  type: 'AB',

  variantA: defaultEndpoint(),
  variantB: defaultEndpoint(),
  splitA: 50,
  splitB: 50,
  bucketingKeySource: 'header',
  bucketingKeyValue: 'x-user-id',

  champion: defaultEndpoint(),
  challenger: defaultEndpoint(),
  executionMode: 'parallel',

  correlationIdHeaderName: 'x-correlation-id',
});
