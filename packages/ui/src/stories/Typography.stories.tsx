import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokensOf } from './tokens';

const SAMPLE = 'Traction, dips, muscle-up : 3 × 8 répétitions';

const meta = {
  title: 'Fondations/Typographie',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tailles: Story = {
  render: () => (
    <dl className="divide-y">
      {tokensOf('text').map((token) => (
        <div key={token.name} className="grid gap-2 py-4 md:grid-cols-[12rem_1fr] md:items-baseline">
          <dt>
            <p className="font-mono text-body-s font-semibold">text-{token.name}</p>
            <p className="font-mono text-body-xs text-muted">{token.value}</p>
          </dt>
          {/* Inline style: Tailwind can't detect class names built at runtime. */}
          <dd
            className={token.name.startsWith('body') ? 'font-sans' : 'font-display'}
            style={{
              fontSize: `var(${token.variable})`,
              lineHeight: `var(${token.variable}--line-height)`,
              letterSpacing: `var(${token.variable}--letter-spacing, normal)`,
              fontWeight: `var(${token.variable}--font-weight, 400)`,
            }}
          >
            {SAMPLE}
          </dd>
        </div>
      ))}
    </dl>
  ),
};

export const Polices: Story = {
  render: () => (
    <dl className="divide-y">
      {tokensOf('font').map((token) => (
        <div key={token.name} className="grid gap-2 py-4 md:grid-cols-[12rem_1fr] md:items-baseline">
          <dt>
            <p className="font-mono text-body-s font-semibold">font-{token.name}</p>
            <p className="font-mono text-body-xs text-muted">{token.value.split(',')[0]}</p>
          </dt>
          <dd className="text-title-l" style={{ fontFamily: `var(${token.variable})` }}>
            {SAMPLE}
          </dd>
        </div>
      ))}
    </dl>
  ),
};
