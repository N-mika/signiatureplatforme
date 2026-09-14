"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = 'https://mxbzfekwbvybtxlutkpz.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14YnpmZWt3YnZ5YnR4bHV0a3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDA5MzgsImV4cCI6MjA2OTk3NjkzOH0.uzpo6Ar5fCylFHcMjoRwWQybMJ3TknzJoSHCGFkmkQs";
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const loginAndCheck = async () => {
    const { error: signInError } = await exports.supabase.auth.signInWithPassword({
        email: "nadrasanamichael@gmail.com",
        password: "0000",
    });
    if (signInError) {
        console.error("Erreur de connexion:", signInError.message);
        return;
    }
};
loginAndCheck();
