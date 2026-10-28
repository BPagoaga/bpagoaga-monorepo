import { type Backup, exportData, useImportData } from '@bpagoaga/calisthenics-api-client';
import { useMutation } from '@tanstack/react-query';

// File handling around the generated backup endpoints: download the export, read the file to import.

const download = (fileName: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  link.click();
  URL.revokeObjectURL(url);
};

export const useExportBackup = () =>
  useMutation({
    mutationFn: async () => {
      const backup = await exportData();
      download(`calibuddy-${backup.exportedAt.slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
    },
  });

/** Replaces all of the user's data with a backup file's content; the API validates it. */
export const useImportBackup = () => {
  const importData = useImportData();
  return useMutation({
    mutationFn: async (file: File) => {
      let backup: Backup;
      try {
        backup = JSON.parse(await file.text()) as Backup;
      } catch {
        throw new Error('Ce fichier n’est pas un export CaliBuddy (JSON illisible).');
      }
      await importData.mutateAsync({ data: backup });
    },
  });
};
