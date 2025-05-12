import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wallet2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function DiagnoseAuth() {
  const [apiKeyStatus, setApiKeyStatus] = useState<"untested" | "valid" | "invalid">("untested");
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "connected" | "error">("untested");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Test the API key by making a simple request
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        if (error.message.includes('API key')) {
          setApiKeyStatus("invalid");
          setErrorMessage(`API Key error: ${error.message}`);
        } else {
          setApiKeyStatus("valid");
          setConnectionStatus("error");
          setErrorMessage(`Connection error: ${error.message}`);
        }
      } else {
        setApiKeyStatus("valid");
        setConnectionStatus("connected");
      }
    } catch (error: any) {
      setConnectionStatus("error");
      setErrorMessage(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-budget-green flex items-center justify-center mb-4">
            <Wallet2 className="text-white h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Supabase Auth Diagnostics</h1>
          <p className="text-muted-foreground mt-2">
            Testing connection to Supabase authentication
          </p>
        </div>

        <div className="space-y-6 mt-8">
          <div className="bg-background rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">API Key Status</div>
              {apiKeyStatus === "valid" ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  Valid
                </div>
              ) : apiKeyStatus === "invalid" ? (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-5 w-5 mr-1" />
                  Invalid
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 mr-1" />
                  Untested
                </div>
              )}
            </div>
          </div>

          <div className="bg-background rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Connection Status</div>
              {connectionStatus === "connected" ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  Connected
                </div>
              ) : connectionStatus === "error" ? (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-5 w-5 mr-1" />
                  Error
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 mr-1" />
                  Untested
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg p-4 text-sm">
              <pre className="whitespace-pre-wrap">{errorMessage}</pre>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={testConnection} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Testing..." : "Test Connection Again"}
            </Button>
            <div className="text-xs text-muted-foreground mt-2">
              <p>Project ID: kimfcqjzyehxxpxmjqdc</p>
              <p>URL: {supabase.supabaseUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 