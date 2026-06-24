'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  Send,
  Settings,
  Smartphone,
} from 'lucide-react';

import { PERMISSIONS } from '@/features/rbac/constants/permissions';
import { usePermissionContext } from '@/features/rbac/providers/permission-provider';
import {
  ChannelProvider,
  ChannelSummary,
  channelsService,
} from '@/services/channels.service';

type InboxView = 'list' | 'marketplace' | 'connect';
type FormValues = Record<string, string>;

interface ChannelField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'password';
  sensitive?: boolean;
  guideHref?: string;
  guideLabel?: string;
  helpText: string;
}

interface ChannelConfig {
  type: ChannelProvider;
  label: string;
  description: string;
  accentClassName: string;
  icon: typeof MessageCircle;
  fields: ChannelField[];
}

const channelConfigs: Record<ChannelProvider, ChannelConfig> = {
  whatsapp: {
    type: 'whatsapp',
    label: 'WhatsApp',
    description: 'Connect a WhatsApp Business inbox.',
    accentClassName: 'bg-emerald-100 text-emerald-800',
    icon: Smartphone,
    fields: [
      {
        key: 'phone_number_id',
        label: 'Phone Number ID',
        placeholder: '1234567890',
        guideHref: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
        guideLabel: 'Cloud API guide',
        helpText: 'Copy this from the WhatsApp Cloud API phone number settings.',
      },
      {
        key: 'waba_id',
        label: 'WABA ID',
        placeholder: '9876543210',
        guideHref: 'https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts',
        guideLabel: 'WABA guide',
        helpText: 'Use the WhatsApp Business Account ID that owns this phone number.',
      },
      {
        key: 'access_token',
        label: 'Access Token',
        placeholder: 'Paste access token',
        type: 'password',
        sensitive: true,
        guideHref: 'https://developers.facebook.com/docs/facebook-login/guides/access-tokens',
        guideLabel: 'Token guide',
        helpText: 'Use a system user access token with WhatsApp messaging permissions.',
      },
    ],
  },
  telegram: {
    type: 'telegram',
    label: 'Telegram',
    description: 'Connect a Telegram bot inbox.',
    accentClassName: 'bg-sky-100 text-sky-800',
    icon: Send,
    fields: [
      {
        key: 'bot_token',
        label: 'Bot Token',
        placeholder: '123456:ABC-DEF...',
        type: 'password',
        sensitive: true,
        guideHref: 'https://t.me/BotFather',
        guideLabel: '@BotFather',
        helpText: 'Create or select a bot in @BotFather, then paste the bot token.',
      },
    ],
  },
  messenger: {
    type: 'messenger',
    label: 'Messenger',
    description: 'Connect a Facebook Page inbox.',
    accentClassName: 'bg-blue-100 text-blue-800',
    icon: MessageCircle,
    fields: [
      {
        key: 'page_id',
        label: 'Page ID',
        placeholder: 'Facebook Page ID',
        guideHref: 'https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup',
        guideLabel: 'Messenger setup',
        helpText: 'Use the Facebook Page ID for the Messenger inbox.',
      },
      {
        key: 'page_access_token',
        label: 'Page Access Token',
        placeholder: 'Paste page access token',
        type: 'password',
        sensitive: true,
        guideHref: 'https://developers.facebook.com/docs/pages/access-tokens',
        guideLabel: 'Page token guide',
        helpText: 'Use a Page access token with Messenger permissions.',
      },
    ],
  },
  instagram: {
    type: 'instagram',
    label: 'Instagram',
    description: 'Connect Instagram direct messages.',
    accentClassName: 'bg-pink-100 text-pink-800',
    icon: MessageCircle,
    fields: [
      {
        key: 'instagram_business_account_id',
        label: 'Instagram Business Account ID',
        placeholder: 'Instagram Business Account ID',
        guideHref: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login',
        guideLabel: 'Instagram API guide',
        helpText: 'Use the Instagram Business Account ID connected to your Facebook Page.',
      },
      {
        key: 'access_token',
        label: 'Access Token',
        placeholder: 'Paste access token',
        type: 'password',
        sensitive: true,
        guideHref: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-login',
        guideLabel: 'Business login guide',
        helpText: 'Use a Meta access token that can read and manage Instagram messages.',
      },
    ],
  },
};

export function InboxManagementDashboard() {
  const [view, setView] = useState<InboxView>('list');
  const [inboxes, setInboxes] = useState<ChannelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<ChannelProvider | null>(null);
  const [createName, setCreateName] = useState('');
  const [createValues, setCreateValues] = useState<FormValues>({});
  const [createFieldErrors, setCreateFieldErrors] = useState<FormValues>({});
  const [testedChannel, setTestedChannel] = useState<ChannelProvider | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingConnection, setIsSavingConnection] = useState(false);
  const [manageInbox, setManageInbox] = useState<ChannelSummary | null>(null);
  const [manageValues, setManageValues] = useState<FormValues>({});
  const [manageFieldErrors, setManageFieldErrors] = useState<FormValues>({});
  const [isSavingManagedInbox, setIsSavingManagedInbox] = useState(false);
  const [failedChannelIds, setFailedChannelIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'warning' | 'error'>(
    'success',
  );
  const { hasPermission } = usePermissionContext();
  const canManageChannels = hasPermission(PERMISSIONS.ChannelManage);
  const selectedConfig = selectedChannel ? channelConfigs[selectedChannel] : null;
  const messageClassName =
    messageTone === 'error'
      ? 'bg-red-100 text-red-800'
      : messageTone === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-emerald-100 text-emerald-800';

  const marketplaceChannels = useMemo(
    () => Object.values(channelConfigs),
    [],
  );

  useEffect(() => {
    async function loadChannels() {
      setIsLoading(true);

      try {
        setInboxes(await channelsService.listChannels());
      } catch (error) {
        showMessage(getErrorMessage(error, 'Could not load channels.'), 'error');
      } finally {
        setIsLoading(false);
      }
    }

    void loadChannels();
  }, []);

  function showMessage(nextMessage: string, tone: 'success' | 'warning' | 'error') {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
    ) {
      return error.response.data.message;
    }

    return fallbackMessage;
  }

  function buildFieldErrors(config: ChannelConfig, messageText: string) {
    const normalizedMessage = messageText.toLowerCase().replace(/[_-]/g, ' ');
    const matchedField = config.fields.find((field) => {
      const normalizedKey = field.key.toLowerCase().replace(/[_-]/g, ' ');
      const normalizedLabel = field.label.toLowerCase();

      return (
        normalizedMessage.includes(normalizedKey) ||
        normalizedMessage.includes(normalizedLabel) ||
        normalizedKey
          .split(' ')
          .filter((part) => part.length > 2)
          .some((part) => normalizedMessage.includes(part))
      );
    });

    if (matchedField) {
      return {
        [matchedField.key]: messageText,
      };
    }

    return config.fields.reduce<FormValues>((errors, field) => {
      errors[field.key] = messageText;
      return errors;
    }, {});
  }

  function buildMissingFieldError(config: ChannelConfig, field: ChannelField) {
    return {
      [field.key]: `${field.label} is required.`,
    };
  }

  function resetCreateFlow() {
    setView('list');
    setSelectedChannel(null);
    setCreateName('');
    setCreateValues({});
    setCreateFieldErrors({});
    setTestedChannel(null);
    setIsTestingConnection(false);
    setIsSavingConnection(false);
  }

  function openMarketplace() {
    setView('marketplace');
    setSelectedChannel(null);
    setCreateName('');
    setCreateValues({});
    setCreateFieldErrors({});
    setTestedChannel(null);
    setMessage('');
  }

  function chooseChannel(channel: ChannelProvider) {
    setSelectedChannel(channel);
    setCreateName(`${channelConfigs[channel].label} Inbox`);
    setCreateValues({});
    setCreateFieldErrors({});
    setTestedChannel(null);
    setView('connect');
  }

  function updateCreateValue(key: string, value: string) {
    setCreateValues((current) => ({
      ...current,
      [key]: value,
    }));
    setCreateFieldErrors((current) => {
      const { [key]: _removedError, ...rest } = current;
      return rest;
    });
    setTestedChannel(null);
  }

  function openManageDrawer(inbox: ChannelSummary) {
    setManageInbox(inbox);
    setManageValues({});
    setManageFieldErrors({});
    setMessage('');
  }

  function closeManageDrawer() {
    setManageInbox(null);
    setManageValues({});
    setManageFieldErrors({});
  }

  async function testConnection() {
    if (!selectedConfig) {
      return;
    }

    setCreateFieldErrors({});
    const missingField = selectedConfig.fields.find(
      (field) => !createValues[field.key]?.trim(),
    );

    if (!createName.trim() || missingField) {
      if (missingField) {
        setCreateFieldErrors(buildMissingFieldError(selectedConfig, missingField));
      }
      showMessage('Complete the inbox name and required channel fields first.', 'warning');
      return;
    }

    setIsTestingConnection(true);

    try {
      await channelsService.testConnection({
        provider: selectedConfig.type,
        credentials: createValues,
      });
      setTestedChannel(selectedConfig.type);
      showMessage(`${selectedConfig.label} connection test passed.`, 'success');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Connection test failed.');
      setTestedChannel(null);
      setCreateFieldErrors(buildFieldErrors(selectedConfig, errorMessage));
      showMessage(errorMessage, 'error');
    } finally {
      setIsTestingConnection(false);
    }
  }

  async function createInbox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageChannels) {
      showMessage('Creating inboxes requires channel:manage.', 'warning');
      return;
    }

    if (!selectedConfig || testedChannel !== selectedConfig.type) {
      showMessage('Test the connection before submitting this inbox.', 'warning');
      return;
    }

    setIsSavingConnection(true);

    try {
      const createdInbox = await channelsService.createChannel({
        provider: selectedConfig.type,
        name: createName.trim(),
        credentials: createValues,
      });
      setInboxes((current) => [createdInbox, ...current]);
      setFailedChannelIds((current) => current.filter((id) => id !== createdInbox.id));
      resetCreateFlow();
      showMessage(`${createdInbox.name} connected.`, 'success');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Could not create inbox.');
      setCreateFieldErrors(buildFieldErrors(selectedConfig, errorMessage));
      showMessage(errorMessage, 'error');
    } finally {
      setIsSavingConnection(false);
    }
  }

  async function saveManagedInbox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!manageInbox) {
      return;
    }

    if (!canManageChannels) {
      showMessage('Updating inboxes requires channel:manage.', 'warning');
      return;
    }

    const config = channelConfigs[manageInbox.provider];
    const nextConfig = config.fields.reduce<FormValues>(
      (values, field) => {
        const nextValue = manageValues[field.key]?.trim();

        if (nextValue) {
          values[field.key] = nextValue;
        }

        return values;
      },
      {},
    );

    setManageFieldErrors({});
    setIsSavingManagedInbox(true);

    try {
      const updatedInbox = await channelsService.updateChannel(manageInbox.id, {
        credentials: nextConfig,
      });
      setInboxes((current) =>
        current.map((inbox) =>
          inbox.id === updatedInbox.id ? updatedInbox : inbox,
        ),
      );
      setFailedChannelIds((current) =>
        current.filter((channelId) => channelId !== updatedInbox.id),
      );
      closeManageDrawer();
      showMessage(`${manageInbox.name} updated.`, 'success');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Could not update inbox.');
      setFailedChannelIds((current) =>
        current.includes(manageInbox.id) ? current : [...current, manageInbox.id],
      );
      setManageFieldErrors(buildFieldErrors(config, errorMessage));
      showMessage(errorMessage, 'error');
    } finally {
      setIsSavingManagedInbox(false);
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <section
          className={[
            'flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium',
            messageClassName,
          ].join(' ')}
        >
          <Check aria-hidden="true" size={16} />
          {message}
        </section>
      ) : null}

      {view === 'list' ? (
        <section className="rounded-md border border-border bg-white shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Active Inboxes</h2>
              <p className="mt-1 text-sm text-muted">
                Connected messaging channels available to the workspace.
              </p>
            </div>
            <button
              type="button"
              disabled={!canManageChannels}
              onClick={openMarketplace}
              title={!canManageChannels ? 'Requires channel:manage.' : undefined}
              className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Add New Inbox
            </button>
          </div>
          {!canManageChannels ? (
            <div className="border-b border-border bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">
              You can view inboxes, but adding or updating inboxes requires
              channel:manage.
            </div>
          ) : null}

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-sm text-muted">Loading inboxes...</div>
            ) : null}
            {!isLoading && !inboxes.length ? (
              <div className="col-span-full rounded-md border border-dashed border-border p-6 text-sm text-muted">
                No connected inboxes yet.
              </div>
            ) : null}
            {inboxes.map((inbox) => {
              const config = channelConfigs[inbox.provider];
              const Icon = config.icon;
              const hasFailed = failedChannelIds.includes(inbox.id);

              return (
                <article
                  key={inbox.id}
                  className="rounded-md border border-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-md',
                        config.accentClassName,
                      ].join(' ')}
                    >
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <span
                      className={[
                        'rounded-md px-2 py-1 text-xs font-medium',
                        hasFailed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800',
                      ].join(' ')}
                    >
                      {hasFailed ? 'Failed' : 'Connected'}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{inbox.name}</h3>
                  <p className="mt-1 text-xs text-muted">{config.label}</p>
                  <button
                    type="button"
                    onClick={() => openManageDrawer(inbox)}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
                  >
                    <Settings aria-hidden="true" size={15} />
                    Manage
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === 'marketplace' ? (
        <section className="space-y-5">
          <button
            type="button"
            onClick={resetCreateFlow}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-ink"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Back
          </button>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {marketplaceChannels.map((channel) => {
              const Icon = channel.icon;

              return (
                <button
                  key={channel.type}
                  type="button"
                  onClick={() => chooseChannel(channel.type)}
                  className="rounded-md border border-border bg-white p-5 text-left shadow-panel hover:border-brand"
                >
                  <span
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-md',
                      channel.accentClassName,
                    ].join(' ')}
                  >
                    <Icon aria-hidden="true" size={21} />
                  </span>
                  <span className="mt-4 block text-sm font-semibold">
                    {channel.label}
                  </span>
                  <span className="mt-2 block text-sm text-muted">
                    {channel.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === 'connect' && selectedConfig ? (
        <section className="rounded-md border border-border bg-white p-5 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">
                Connect {selectedConfig.label}
              </h2>
              <p className="mt-1 text-sm text-muted">{selectedConfig.description}</p>
            </div>
            <button
              type="button"
              onClick={resetCreateFlow}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-ink"
            >
              <ArrowLeft aria-hidden="true" size={15} />
              Back
            </button>
          </div>

          <form onSubmit={(event) => void createInbox(event)} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Inbox Name</span>
              <input
                value={createName}
                onChange={(event) => {
                  setCreateName(event.target.value);
                  setTestedChannel(null);
                }}
                className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm"
                placeholder={`${selectedConfig.label} Inbox`}
                disabled={!canManageChannels}
                required
              />
            </label>

            <ChannelFields
              config={selectedConfig}
              values={createValues}
              fieldErrors={createFieldErrors}
              disabled={!canManageChannels}
              onChange={updateCreateValue}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void testConnection()}
                disabled={!canManageChannels || isTestingConnection}
                title={!canManageChannels ? 'Requires channel:manage.' : undefined}
                className="h-10 rounded-md border border-border px-4 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              >
                {isTestingConnection ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 aria-hidden="true" className="animate-spin" size={15} />
                    Testing
                  </span>
                ) : (
                  'Test Connection'
                )}
              </button>
              <button
                type="submit"
                disabled={
                  !canManageChannels ||
                  testedChannel !== selectedConfig.type ||
                  isSavingConnection
                }
                title={
                  !canManageChannels
                    ? 'Requires channel:manage.'
                    : testedChannel !== selectedConfig.type
                      ? 'Test the connection first.'
                      : undefined
                }
                className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSavingConnection ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 aria-hidden="true" className="animate-spin" size={15} />
                    Saving
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {manageInbox ? (
        <div className="fixed inset-0 z-40 bg-ink/30 px-4 py-6">
          <div className="ml-auto flex h-full w-full max-w-xl flex-col rounded-md bg-white shadow-panel">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Manage {manageInbox.name}</h2>
              <p className="mt-1 text-sm text-muted">
                Sensitive values are masked. Leave them blank to keep existing tokens.
              </p>
            </div>

            <form
              onSubmit={(event) => void saveManagedInbox(event)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <ChannelFields
                  config={channelConfigs[manageInbox.provider]}
                  values={manageValues}
                  existingValues={manageInbox.credentials}
                  fieldErrors={manageFieldErrors}
                  disabled={!canManageChannels}
                  onChange={(key, value) =>
                    setManageValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
                <button
                  type="button"
                  onClick={closeManageDrawer}
                  className="h-10 rounded-md border border-border px-4 text-sm font-medium text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canManageChannels || isSavingManagedInbox}
                  className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingManagedInbox ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 aria-hidden="true" className="animate-spin" size={15} />
                      Saving
                    </span>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChannelFields({
  config,
  values,
  existingValues,
  fieldErrors,
  disabled,
  onChange,
}: {
  config: ChannelConfig;
  values: FormValues;
  existingValues?: FormValues;
  fieldErrors?: FormValues;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
}) {
  const [revealedFields, setRevealedFields] = useState<string[]>([]);

  function toggleReveal(fieldKey: string) {
    setRevealedFields((current) =>
      current.includes(fieldKey)
        ? current.filter((key) => key !== fieldKey)
        : [...current, fieldKey],
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {config.fields.map((field) => {
        const isRevealed = revealedFields.includes(field.key);
        const inputType = field.sensitive && isRevealed ? 'text' : field.type ?? 'text';
        const error = fieldErrors?.[field.key];

        return (
          <label key={field.key} className="block">
            <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
              {field.label}
              {field.guideHref ? (
                <a
                  href={field.guideHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent"
                >
                  {field.guideLabel}
                  <ExternalLink aria-hidden="true" size={12} />
                </a>
              ) : null}
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted">
              {field.helpText}
            </span>
            <span className="relative mt-2 block">
              <input
                value={values[field.key] ?? ''}
                onChange={(event) => onChange(field.key, event.target.value)}
                type={inputType}
                className={[
                  'h-10 w-full rounded-md border px-3 text-sm',
                  field.sensitive ? 'pr-11' : '',
                  error ? 'border-red-500 bg-red-50' : 'border-border',
                ].join(' ')}
                placeholder={
                  existingValues?.[field.key] && field.sensitive
                    ? '••••••••'
                    : field.placeholder
                }
                disabled={disabled}
                required={!existingValues}
              />
              {field.sensitive ? (
                <button
                  type="button"
                  onClick={() => toggleReveal(field.key)}
                  disabled={disabled}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface disabled:cursor-not-allowed"
                  aria-label={isRevealed ? 'Hide token' : 'Reveal token'}
                  title={isRevealed ? 'Hide token' : 'Reveal token'}
                >
                  {isRevealed ? (
                    <EyeOff aria-hidden="true" size={16} />
                  ) : (
                    <Eye aria-hidden="true" size={16} />
                  )}
                </button>
              ) : null}
            </span>
            {error ? (
              <span className="mt-1 block text-xs font-medium text-red-700">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
