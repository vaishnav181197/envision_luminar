"use client";

import { useState } from "react";
import { Mail, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortDate } from "@/lib/utils/format-date";
import type { EligibleStudent } from "@/types/admin";

export interface AdminVotersProps {
  voters: EligibleStudent[];
  loading?: boolean;
  onAdd: (email: string) => Promise<{ success: boolean; error?: string }>;
  onImport: (
    file: File,
  ) => Promise<{ success: boolean; error?: string; imported?: number; found?: number }>;
  onDelete: (id: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

export function AdminVoters({
  voters,
  loading,
  onAdd,
  onImport,
  onDelete,
}: AdminVotersProps) {
  const [email, setEmail] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdding(true);
    setAddError(null);
    const result = await onAdd(email);
    setAdding(false);
    if (!result.success) {
      setAddError(result.error ?? "Could not add that email");
      return;
    }
    setEmail("");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportMessage(null);
    const result = await onImport(file);
    setImporting(false);

    if (!result.success) {
      setImportError(result.error ?? "Could not import that file");
      return;
    }

    setImportMessage(
      `Imported ${result.imported ?? 0} of ${result.found ?? 0} unique emails.`,
    );
  };

  const handleDelete = async (id: string, voterEmail: string) => {
    setDeletingId(id);
    await onDelete(id, voterEmail);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Voters
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Register the admission emails that may enter voting. Students prove
          inbox access with a 6-digit code.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add one email</CardTitle>
            <CardDescription>
              Emails are stored uniquely in lowercase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void handleAdd(event)} className="space-y-4">
              <Input
                label="Student email"
                type="email"
                placeholder="student@institute.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="off"
              />
              {addError && (
                <p className="text-sm text-error-500" role="alert">
                  {addError}
                </p>
              )}
              <Button type="submit" loading={adding}>
                Add voter
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import spreadsheet</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file of email addresses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full flex-col gap-1.5">
              <label
                htmlFor="voter-file"
                className="text-sm font-medium text-text-primary"
              >
                Email file
              </label>
              <input
                id="voter-file"
                type="file"
                accept=".csv,.txt,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => void handleImport(event)}
                disabled={importing}
                className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700"
              />
            </div>
            {importError && (
              <p className="text-sm text-error-500" role="alert">
                {importError}
              </p>
            )}
            {importMessage && (
              <p className="text-sm text-success-600" role="status">
                {importMessage}
              </p>
            )}
            <p className="text-xs text-text-muted">
              <Upload className="mr-1 inline h-3.5 w-3.5" />
              Duplicate emails are skipped.
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="h-40 skeleton rounded-xl" />
      ) : voters.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-5 w-5" />}
          title="No voters yet"
          description="Add one email or import a spreadsheet to open student voting."
        />
      ) : (
        <Card padding="none">
          <CardHeader className="border-b border-divider px-5 py-4">
            <CardTitle>Registered emails</CardTitle>
            <CardDescription>
              {voters.length} unique {voters.length === 1 ? "address" : "addresses"}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell className="font-medium text-text-primary">
                      {voter.email}
                    </TableCell>
                    <TableCell className="hidden text-text-secondary sm:table-cell">
                      {formatShortDate(voter.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-error-600 hover:bg-error-50 hover:text-error-700"
                        loading={deletingId === voter.id}
                        onClick={() => void handleDelete(voter.id, voter.email)}
                        aria-label={`Remove ${voter.email}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
