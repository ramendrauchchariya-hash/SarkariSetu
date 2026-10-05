'use client';
import { useState } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ToolPage() {
  const [a,setA]=useState(''); const [b,setB]=useState(''); const [c,setC]=useState(''); const [result,setResult]=useState<number|null>(null);
  const calculate=()=>{const x=Number(a),y=Number(b),z=Number(c); if (x>=0&&y>=0) setResult(x-y);};
  return <SiteShell><div className="container-page py-8"><h1 className="font-display text-3xl font-bold">Cut-off Analyser</h1><p className="mt-2 text-muted-foreground">Compare your score with a previous or expected cut-off.</p><Card className="mx-auto mt-6 max-w-xl"><CardHeader><CardTitle>Enter values</CardTitle></CardHeader><CardContent className="space-y-4">
  <div><Label>Your score</Label><Input type="number" value={a} onChange={e=>setA(e.target.value)} /></div>
  <div><Label>Cut-off score</Label><Input type="number" value={b} onChange={e=>setB(e.target.value)} /></div>
  <div><Label>(Optional, ignored)</Label><Input type="number" value={c} onChange={e=>setC(e.target.value)} /></div>
  <Button onClick={calculate}>Calculate</Button>{result!==null&&<div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">Result</p><p className="text-2xl font-bold">{result.toLocaleString('en-IN',{maximumFractionDigits:2})}</p><p className="mt-1 text-sm">Positive means your score is above the entered cut-off</p></div>}
  <p className="text-xs text-muted-foreground">This is an estimate only. Always use the official recruitment or examination notice for final eligibility, cut-off and fee information.</p></CardContent></Card></div></SiteShell>;
}