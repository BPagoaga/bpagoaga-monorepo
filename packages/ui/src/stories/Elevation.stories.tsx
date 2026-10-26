import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokensOf } from './tokens';

const meta = {
  title: 'Fondations/Élévations et rayons',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Elevations: Story = {
  name: 'Élévations',
  render: () => (
    <div className="grid gap-8 bg-background p-8 sm:grid-cols-3">
      {tokensOf('shadow').map((token) => (
        <div
          key={token.name}
          className="flex h-32 items-center justify-center rounded-xl bg-surface"
          style={{ boxShadow: `var(${token.variable})` }}
        >
          <p className="font-mono text-body-s font-semibold">shadow-{token.name}</p>
        </div>
      ))}
    </div>
  ),
};

export const Rayons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {tokensOf('radius').map((token) => (
        <figure key={token.name} className="space-y-2">
          <div
            className="h-24 border-2 border-primary-100 bg-primary-10"
            style={{ borderRadius: `var(${token.variable})` }}
          />
          <figcaption>
            <p className="font-mono text-body-s font-semibold">rounded-{token.name}</p>
            <p className="font-mono text-body-xs text-muted">{token.value}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};
