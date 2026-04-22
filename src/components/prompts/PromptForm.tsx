'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { X, Upload, FileImage, FileVideo } from 'lucide-react';
import type { Category } from '@/lib/supabase/types';
import { countTokens } from '@/lib/utils';

type MediaFile = {
  file: File;
  preview: string;
  type: 'image' | 'video';
};

type Props = {
  locale: string;
  categories: Category[];
  userId: string;
  parentId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    content?: string;
    categoryId?: number;
  };
  isFork?: boolean;
};

export default function PromptForm({ locale, categories, userId, parentId, defaultValues, isFork }: Props) {
  const t = useTranslations('newPrompt');
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: defaultValues?.title ?? '',
    description: defaultValues?.description ?? '',
    content: defaultValues?.content ?? '',
    categoryId: defaultValues?.categoryId?.toString() ?? '',
  });
  const [outputText, setOutputText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [outputTab, setOutputTab] = useState('text');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newMedia: MediaFile[] = [];

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} 50MB'dan büyük, atlandı.`);
        continue;
      }
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        toast.error(`${file.name} desteklenmiyor.`);
        continue;
      }
      newMedia.push({
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
      });
    }

    setMediaFiles((prev) => [...prev, ...newMedia]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error('Kategori seçin.');
      return;
    }
    setLoading(true);

    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        title: form.title,
        description: form.description || null,
        content: form.content,
        category_id: parseInt(form.categoryId),
        token_count: countTokens(form.content),
        ...(parentId ? { parent_id: parentId } : {}),
      })
      .select()
      .single();

    if (error || !prompt) {
      toast.error(error?.message ?? 'Hata oluştu.');
      setLoading(false);
      return;
    }

    // Metin çıktısı
    if (outputTab === 'text' && outputText.trim()) {
      await supabase.from('prompt_outputs').insert({
        prompt_id: prompt.id,
        type: 'text',
        content: outputText.trim(),
      });
    }

    // Medya dosyaları yükle
    if (outputTab === 'media' && mediaFiles.length > 0) {
      for (let i = 0; i < mediaFiles.length; i++) {
        const { file, type } = mediaFiles[i];
        const ext = file.name.split('.').pop();
        const path = `outputs/${prompt.id}/${i}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('outputs')
          .upload(path, file, { upsert: true });

        if (uploadError) {
          toast.error(`${file.name} yüklenemedi: ${uploadError.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from('outputs').getPublicUrl(uploadData.path);
        await supabase.from('prompt_outputs').insert({
          prompt_id: prompt.id,
          type,
          content: urlData.publicUrl,
        });
      }
    }

    toast.success('Prompt yayınlandı!');
    router.push(`/${locale}/prompts/${prompt.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">
        {isFork ? t('forkTitle') : t('title')}
      </h1>

      <div className="space-y-1">
        <Label htmlFor="title">{t('titleLabel')}</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder={t('titlePlaceholder')}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">{t('descriptionLabel')}</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="category">{t('categoryLabel')}</Label>
        <Select value={form.categoryId} onValueChange={(v) => update('categoryId', v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.icon} {locale === 'tr' ? cat.name_tr : cat.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="content">{t('contentLabel')}</Label>
        <Textarea
          id="content"
          value={form.content}
          onChange={(e) => update('content', e.target.value)}
          placeholder={t('contentPlaceholder')}
          className="min-h-48 font-mono text-sm"
          required
        />
        <p className="text-xs text-right text-blue-500 dark:text-blue-400 font-mono">
          ~{countTokens(form.content).toLocaleString()} {t('tokens')}
        </p>
      </div>

      {/* Örnek Çıktı */}
      <div className="space-y-2 border rounded-lg p-4">
        <Label>{t('outputLabel')}</Label>
        <Tabs value={outputTab} onValueChange={setOutputTab}>
          <TabsList>
            <TabsTrigger value="text">{t('outputTextTab')}</TabsTrigger>
            <TabsTrigger value="media">Görsel / Video</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-2">
            <Textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              placeholder={t('outputTextPlaceholder')}
              className="min-h-28 text-sm"
            />
          </TabsContent>

          <TabsContent value="media" className="mt-2 space-y-3">
            {/* Yükleme alanı */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Dosya seç veya buraya sürükle</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP, GIF, MP4, MOV, WEBM — maks. 50MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Seçilen dosyalar */}
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-muted/20">
                    {/* Önizleme */}
                    <div className="shrink-0 h-12 w-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {media.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={media.preview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <FileVideo className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{media.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {media.type === 'image' ? (
                          <span className="flex items-center gap-1"><FileImage className="h-3 w-3" /> Görsel</span>
                        ) : (
                          <span className="flex items-center gap-1"><FileVideo className="h-3 w-3" /> Video</span>
                        )}
                        {' · '}{(media.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="shrink-0 h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('saving') : isFork ? t('submitFork') : t('submit')}
      </Button>
    </form>
  );
}
