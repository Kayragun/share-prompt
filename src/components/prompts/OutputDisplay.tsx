import { getTranslations } from 'next-intl/server';
import type { PromptOutput } from '@/lib/supabase/types';
import Image from 'next/image';

type Props = {
  outputs: PromptOutput[];
};

export default async function OutputDisplay({ outputs }: Props) {
  const t = await getTranslations('prompt');

  if (!outputs || outputs.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('exampleOutput')}</h2>
        <p className="text-sm text-muted-foreground">{t('noOutput')}</p>
      </div>
    );
  }

  const textOutputs = outputs.filter((o) => o.type === 'text');
  const mediaOutputs = outputs.filter((o) => o.type === 'image' || o.type === 'video');

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{t('exampleOutput')}</h2>
      <div className="space-y-4">
        {/* Metin çıktıları */}
        {textOutputs.map((output) => (
          <div key={output.id} className="border rounded-lg overflow-hidden">
            <pre className="p-4 text-sm whitespace-pre-wrap bg-muted/30 font-mono">{output.content}</pre>
          </div>
        ))}

        {/* Medya çıktıları */}
        {mediaOutputs.length > 0 && (
          <div className={`grid gap-3 ${mediaOutputs.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {mediaOutputs.map((output) => (
              <div key={output.id} className="border rounded-lg overflow-hidden bg-muted">
                {output.type === 'image' ? (
                  <div className="relative w-full">
                    <Image
                      src={output.content}
                      alt="Örnek çıktı"
                      width={800}
                      height={500}
                      className="w-full h-auto object-contain max-h-96"
                    />
                  </div>
                ) : (
                  <video
                    src={output.content}
                    controls
                    className="w-full max-h-96"
                    preload="metadata"
                  >
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
