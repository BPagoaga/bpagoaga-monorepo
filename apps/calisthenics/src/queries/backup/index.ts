import { useMutation, useQueryClient } from '@tanstack/react-query';

const download = (fileName: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  link.click();
  URL.revokeObjectURL(url);
};

export const useExportData = () =>
  useMutation({
    mutationFn: async () => {
      // Loaded on demand: the backup module carries zod, only needed for export / import.
      const { exportData } = await import('../../db/backup');
      const backup = await exportData();
      download(`calibuddy-${backup.exportedAt.slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
    },
  });

/** Replaces all local data with a backup file's content. */
export const useImportData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const { importData, parseBackup } = await import('../../db/backup');
      await importData(parseBackup(await file.text()));
    },
    onSettled: () => queryClient.invalidateQueries({ refetchType: 'all' }),
  });
};
