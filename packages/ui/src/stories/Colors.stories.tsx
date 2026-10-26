import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorScales, singleColors, type ISwatch } from './tokens';

const Swatch = ({ token, label }: ISwatch) => (
  <figure className="space-y-1">
    <div
      className="h-14 rounded-lg border shadow-elevation-1"
      style={{ backgroundColor: `var(${token.variable})` }}
      title={token.value}
    />
    <figcaption>
      <p className="text-body-s font-semibold">{label}</p>
      <p className="font-mono text-body-xs text-muted">{token.value}</p>
    </figcaption>
  </figure>
);

const meta = {
  title: 'Fondations/Couleurs',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Echelles: Story = {
  name: 'Échelles',
  render: () => (
    <div className="space-y-8">
      <p className="max-w-2xl text-body-m text-muted">
        De 10 (le plus clair) à 150 (le plus foncé), 100 étant la teinte de référence. Classes :{' '}
        <code className="font-mono">bg-primary-100</code>, <code className="font-mono">text-red-120</code>…
      </p>
      {colorScales().map((scale) => (
        <section key={scale.name} aria-labelledby={`scale-${scale.name}`}>
          <h2 id={`scale-${scale.name}`} className="mb-3 font-display text-title-m capitalize">
            {scale.name}
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-15">
            {scale.shades.map((token) => (
              <Swatch key={token.name} token={token} label={token.name.replace(`${scale.name}-`, '')} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const AliasSemantiques: Story = {
  name: 'Alias sémantiques',
  render: () => (
    <div className="space-y-4">
      <p className="max-w-2xl text-body-m text-muted">
        À privilégier pour les fonds, surfaces, bordures et textes : <code className="font-mono">bg-surface</code>,{' '}
        <code className="font-mono">text-muted</code>…
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {singleColors().map((token) => (
          <Swatch key={token.name} token={token} label={token.name} />
        ))}
      </div>
    </div>
  ),
};
