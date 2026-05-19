import { signIn, signUp } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10">
      <Card className="w-full rounded-lg border-0 shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle className="text-base">Supabase account</CardTitle>
          <CardDescription>Sign in or create a test account to access protected booking flows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}
          <form className="space-y-3">
            <label className="grid gap-1 text-xs font-medium">
              Email
              <Input name="email" type="email" required defaultValue="test.passenger@example.com" placeholder="you@example.com" />
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Password
              <Input name="password" type="password" required minLength={6} defaultValue="SourceAsia123!" placeholder="At least 6 characters" />
            </label>
            <div className="rounded-lg border bg-muted/60 p-3 text-sm">
              <p className="font-medium">Demo login</p>
              <p className="mt-1 text-muted-foreground">Email: test.passenger@example.com</p>
              <p className="text-muted-foreground">Password: SourceAsia123!</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button formAction={signIn} type="submit">
                Sign in
              </Button>
              <Button formAction={signUp} type="submit" variant="outline">
                Create account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
