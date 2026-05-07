'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  KeyRound,
  Lock,
  Unlock,
  Copy,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Shuffle,
} from 'lucide-react';

// ============================================================
// Caesar Cipher
// ============================================================
function caesarEncrypt(text: string, shift: number): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      return char;
    })
    .join('');
}

function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, 26 - shift);
}

// ============================================================
// Vigenere Cipher
// ============================================================
function vigenereEncrypt(text: string, key: string): string {
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    })
    .join('');
}

function vigenereDecrypt(text: string, key: string): string {
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
      }
      return char;
    })
    .join('');
}

// ============================================================
// XOR Cipher
// ============================================================
function xorEncrypt(text: string, key: string): string {
  if (!key) return text;
  return text
    .split('')
    .map((char, i) => {
      const xored = char.charCodeAt(0) ^ key.charCodeAt(i % key.length);
      return xored.toString(16).padStart(2, '0');
    })
    .join(' ');
}

function xorDecrypt(hex: string, key: string): string {
  if (!key) return hex;
  try {
    return hex
      .split(' ')
      .filter((h) => h.length > 0)
      .map((h, i) => String.fromCharCode(parseInt(h, 16) ^ key.charCodeAt(i % key.length)))
      .join('');
  } catch {
    return 'Ошибка декодирования';
  }
}

// ============================================================
// Base64
// ============================================================
function base64Encode(text: string): string {
  try { return btoa(unescape(encodeURIComponent(text))); }
  catch { return 'Ошибка кодирования'; }
}
function base64Decode(text: string): string {
  try { return decodeURIComponent(escape(atob(text))); }
  catch { return 'Ошибка декодирования'; }
}

// ============================================================
// URL Encoding
// ============================================================
function urlEncode(text: string): string {
  return encodeURIComponent(text);
}
function urlDecode(text: string): string {
  try { return decodeURIComponent(text); }
  catch { return 'Ошибка декодирования'; }
}

// ============================================================
// Hash visualization (simple djb2)
// ============================================================
function simpleHash(text: string): { md5Like: string; shaLike: string; djb2: string } {
  let h1 = 5381;
  let h2 = 0x6a09e667;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) & 0xffffffff;
    h2 = ((h2 ^ (c << 13)) + (c << 7) + (c >> 2)) & 0xffffffff;
  }
  return {
    md5Like: Math.abs(h1).toString(16).padStart(8, '0').repeat(4),
    shaLike: Math.abs(h2).toString(16).padStart(8, '0').repeat(8),
    djb2: Math.abs(h1).toString(16).padStart(8, '0'),
  };
}

// ============================================================
// Copy helper
// ============================================================
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
      {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </Button>
  );
}

export default function ToolsLab() {
  const { completeModule, setCurrentPage, completedModules } = useAppStore();
  const isCompleted = completedModules.includes('tools');

  // Caesar state
  const [caesarText, setCaesarText] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [caesarMode, setCaesarMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Vigenere state
  const [vigenereText, setVigenereText] = useState('');
  const [vigenereKey, setVigenereKey] = useState('secret');
  const [vigenereMode, setVigenereMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // XOR state
  const [xorText, setXorText] = useState('');
  const [xorKey, setXorKey] = useState('key');
  const [xorMode, setXorMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Base64 state
  const [b64Text, setB64Text] = useState('');
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');

  // URL state
  const [urlText, setUrlText] = useState('');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');

  // Hash state
  const [hashText, setHashText] = useState('');

  // Password generator state
  const [pwLength, setPwLength] = useState(16);
  const [pwUppercase, setPwUppercase] = useState(true);
  const [pwLowercase, setPwLowercase] = useState(true);
  const [pwNumbers, setPwNumbers] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const generatePassword = () => {
    let chars = '';
    if (pwUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (pwLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (pwNumbers) chars += '0123456789';
    if (pwSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    const arr = new Uint32Array(pwLength);
    crypto.getRandomValues(arr);
    const pw = Array.from(arr, (v) => chars[v % chars.length]).join('');
    setGeneratedPassword(pw);
  };

  const caesarResult = caesarMode === 'encrypt'
    ? caesarEncrypt(caesarText, caesarShift)
    : caesarDecrypt(caesarText, caesarShift);

  const vigenereResult = vigenereMode === 'encrypt'
    ? vigenereEncrypt(vigenereText, vigenereKey)
    : vigenereDecrypt(vigenereText, vigenereKey);

  const xorResult = xorMode === 'encrypt'
    ? xorEncrypt(xorText, xorKey)
    : xorDecrypt(xorText, xorKey);

  const b64Result = b64Mode === 'encode' ? base64Encode(b64Text) : base64Decode(b64Text);
  const urlResult = urlMode === 'encode' ? urlEncode(urlText) : urlDecode(urlText);
  const hashResult = simpleHash(hashText);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <KeyRound size={20} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Инструменты безопасности</h1>
          <p className="text-xs text-slate-500">Шифры, кодирование, хеширование и генератор паролей</p>
        </div>
      </div>

      <Tabs defaultValue="ciphers" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="ciphers" className="text-xs">
            <Lock size={14} className="mr-1" /> Шифры
          </TabsTrigger>
          <TabsTrigger value="encoding" className="text-xs">
            <Shuffle size={14} className="mr-1" /> Кодирование
          </TabsTrigger>
          <TabsTrigger value="hashing" className="text-xs">
            <KeyRound size={14} className="mr-1" /> Хеши
          </TabsTrigger>
          <TabsTrigger value="passwords" className="text-xs">
            <Unlock size={14} className="mr-1" /> Пароли
          </TabsTrigger>
        </TabsList>

        {/* ===== CIPHERS TAB ===== */}
        <TabsContent value="ciphers" className="space-y-4">
          {/* Caesar */}
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold">Шифр Цезаря</h3>
                <Badge variant="secondary" className="text-[10px]">Классический</Badge>
              </div>
              <p className="text-xs text-slate-500">Сдвиг каждой буквы алфавита на фиксированное число позиций.</p>

              <RadioGroup value={caesarMode} onValueChange={(v) => setCaesarMode(v as 'encrypt' | 'decrypt')} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="encrypt" id="caesar-e" />
                  <Label htmlFor="caesar-e" className="text-xs">Шифрование</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="decrypt" id="caesar-d" />
                  <Label htmlFor="caesar-d" className="text-xs">Дешифрование</Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Сдвиг: {caesarShift}</Label>
                </div>
                <Slider value={[caesarShift]} min={1} max={25} step={1} onValueChange={(v) => setCaesarShift(v[0])} />
              </div>

              <div>
                <Label className="text-xs mb-1 block">Текст:</Label>
                <Input value={caesarText} onChange={(e) => setCaesarText(e.target.value)} placeholder="Введите текст..." className="font-mono text-sm" />
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-amber-700 break-all flex-1">{caesarResult || '...'}</code>
                <CopyButton text={caesarResult} />
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-[11px] text-amber-700">
                  <strong>Пример:</strong> &quot;HELLO&quot; со сдвигом 3 → <code>KHOOR</code>. Используется римским полководцем Цезарем для секретной переписки.
                  Уязвим к частотному анализу — легко взламывается при длине текста более 20 символов.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vigenere */}
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-violet-600" />
                <h3 className="text-sm font-semibold">Шифр Виженера</h3>
                <Badge variant="secondary" className="text-[10px]">Полialфавитный</Badge>
              </div>
              <p className="text-xs text-slate-500">Использует ключевое слово для переменного сдвига каждой буквы. Долгое время считался невзламываемым.</p>

              <RadioGroup value={vigenereMode} onValueChange={(v) => setVigenereMode(v as 'encrypt' | 'decrypt')} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="encrypt" id="vig-e" />
                  <Label htmlFor="vig-e" className="text-xs">Шифрование</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="decrypt" id="vig-d" />
                  <Label htmlFor="vig-d" className="text-xs">Дешифрование</Label>
                </div>
              </RadioGroup>

              <div>
                <Label className="text-xs mb-1 block">Ключевое слово:</Label>
                <Input value={vigenereKey} onChange={(e) => setVigenereKey(e.target.value)} placeholder="secret" className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Текст:</Label>
                <Input value={vigenereText} onChange={(e) => setVigenereText(e.target.value)} placeholder="Введите текст..." className="font-mono text-sm" />
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-violet-700 break-all flex-1">{vigenereResult || '...'}</code>
                <CopyButton text={vigenereResult} />
              </div>

              <CodeBlock
                code={`// Шифр Виженера — JavaScript
function vigenereEncrypt(text, key) {
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  let ki = 0;
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const shift = k.charCodeAt(ki++ % k.length) - 97;
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    return char;
  }).join('');
}`}
                language="javascript"
                title="vigenere.js"
              />
            </CardContent>
          </Card>

          {/* XOR */}
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Unlock size={16} className="text-sky-600" />
                <h3 className="text-sm font-semibold">XOR-шифрование</h3>
                <Badge variant="secondary" className="text-[10px]">Симметричный</Badge>
              </div>
              <p className="text-xs text-slate-500">Побитовое исключающее ИЛИ. Шифрование и дешифрование — одна и та же операция.</p>

              <RadioGroup value={xorMode} onValueChange={(v) => setXorMode(v as 'encrypt' | 'decrypt')} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="encrypt" id="xor-e" />
                  <Label htmlFor="xor-e" className="text-xs">Шифрование</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="decrypt" id="xor-d" />
                  <Label htmlFor="xor-d" className="text-xs">Дешифрование</Label>
                </div>
              </RadioGroup>

              <div>
                <Label className="text-xs mb-1 block">Ключ:</Label>
                <Input value={xorKey} onChange={(e) => setXorKey(e.target.value)} placeholder="key" className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{xorMode === 'encrypt' ? 'Текст' : 'HEX-строка'}:</Label>
                <Input value={xorText} onChange={(e) => setXorText(e.target.value)} placeholder={xorMode === 'encrypt' ? 'Введите текст...' : 'Введите HEX...'} className="font-mono text-sm" />
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-sky-700 break-all flex-1">{xorResult || '...'}</code>
                <CopyButton text={xorResult} />
              </div>

              <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                <p className="text-[11px] text-sky-700">
                  <strong>Свойство:</strong> A XOR B XOR B = A. Поэтому одна и та же операция XOR и шифрует, и дешифрует.
                  XOR используется в OTP (One-Time Pad) — единственном теоретически неразрушимом шифре, если ключ истинно случаен и используется только один раз.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ENCODING TAB ===== */}
        <TabsContent value="encoding" className="space-y-4">
          {/* Base64 */}
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Shuffle size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold">Base64</h3>
                <Badge variant="secondary" className="text-[10px]">Кодировка</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Кодирование бинарных данных в текст. Используется для передачи данных в JSON, email (MIME), Data URL в HTML/CSS.
                <strong>Base64 — НЕ шифрование!</strong> Любой может декодировать данные.
              </p>

              <RadioGroup value={b64Mode} onValueChange={(v) => setB64Mode(v as 'encode' | 'decode')} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="encode" id="b64-e" />
                  <Label htmlFor="b64-e" className="text-xs">Encode</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="decode" id="b64-d" />
                  <Label htmlFor="b64-d" className="text-xs">Decode</Label>
                </div>
              </RadioGroup>

              <div>
                <Label className="text-xs mb-1 block">Текст:</Label>
                <Input value={b64Text} onChange={(e) => setB64Text(e.target.value)} placeholder={b64Mode === 'encode' ? 'Введите текст...' : 'SGVsbG8gV29ybGQ='} className="font-mono text-sm" />
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-emerald-700 break-all flex-1">{b64Result || '...'}</code>
                <CopyButton text={b64Result} />
              </div>
            </CardContent>
          </Card>

          {/* URL Encoding */}
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Shuffle size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold">URL Encoding / Decoding</h3>
                <Badge variant="secondary" className="text-[10px]">RFC 3986</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Кодирование спецсимволов в URL. Необходимый навык для работы с XSS и CSRF — понимание того,
                как браузер интерпретирует закодированные символы.
              </p>

              <RadioGroup value={urlMode} onValueChange={(v) => setUrlMode(v as 'encode' | 'decode')} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="encode" id="url-e" />
                  <Label htmlFor="url-e" className="text-xs">Encode</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="decode" id="url-d" />
                  <Label htmlFor="url-d" className="text-xs">Decode</Label>
                </div>
              </RadioGroup>

              <div>
                <Label className="text-xs mb-1 block">Текст:</Label>
                <Input value={urlText} onChange={(e) => setUrlText(e.target.value)} placeholder='<script>alert("XSS")</script>' className="font-mono text-sm" />
              </div>

              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-amber-700 break-all flex-1">{urlResult || '...'}</code>
                <CopyButton text={urlResult} />
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-[11px] text-amber-700">
                  <strong>Связь с безопасностью:</strong> URL-кодирование может обходить WAF. Например,
                  <code>&lt;script&gt;</code> может быть закодирован как <code>%3Cscript%3E</code>.
                  Некоторые фильтры проверяют декодированный вариант, другие — нет.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== HASHING TAB ===== */}
        <TabsContent value="hashing" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-red-600" />
                <h3 className="text-sm font-semibold">Хеш-функции — визуализация</h3>
              </div>
              <p className="text-xs text-slate-500">
                Хеш-функция преобразует входные данные произвольной длины в строку фиксированной длины.
                Изменение даже одного символа входа полностью меняет хеш. Хеш — <strong>однонаправленный</strong>: нельзя восстановить исходные данные.
              </p>

              <div>
                <Label className="text-xs mb-1 block">Введите текст:</Label>
                <Input value={hashText} onChange={(e) => setHashText(e.target.value)} placeholder="Введите любой текст..." className="font-mono text-sm" />
              </div>

              {hashText && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-1">MD5-подобный (демо):</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-red-700 break-all flex-1">{hashResult.md5Like}</code>
                      <CopyButton text={hashResult.md5Like} />
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-1">SHA-256-подобный (демо):</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-orange-700 break-all flex-1">{hashResult.shaLike}</code>
                      <CopyButton text={hashResult.shaLike} />
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 mb-1">DJB2 (компактный):</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-sky-700 break-all flex-1">{hashResult.djb2}</code>
                      <CopyButton text={hashResult.djb2} />
                    </div>
                  </div>

                  <Separator />

                  {/* Avalanche effect demo */}
                  <div>
                    <p className="text-xs font-semibold mb-2">Эффект лавины (Avalanche Effect):</p>
                    {hashText.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                          <p className="text-[10px] text-emerald-600 mb-1">Оригинал: &quot;{hashText}&quot;</p>
                          <code className="text-[11px] font-mono text-emerald-800 break-all">{hashResult.djb2}</code>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <p className="text-[10px] text-red-600 mb-1">Изменено: &quot;{hashText.slice(0, -1) + (hashText[hashText.length - 1] === 'a' ? 'b' : 'a')}&quot;</p>
                          <code className="text-[11px] font-mono text-red-800 break-all">
                            {simpleHash(hashText.slice(0, -1) + (hashText[hashText.length - 1] === 'a' ? 'b' : 'a')).djb2}
                          </code>
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-2">
                      Даже одно изменение последнего символа полностью меняет результат хеширования — это называется «эффект лавины».
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">Сравнение алгоритмов хеширования</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-slate-500">Алгоритм</th>
                      <th className="text-left py-2 pr-4 text-slate-500">Длина хеша</th>
                      <th className="text-left py-2 pr-4 text-slate-500">Безопасность</th>
                      <th className="text-left py-2 text-slate-500">Применение</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['MD5', '128 бит', 'Небезопасен', 'Контроль целостности файлов'],
                      ['SHA-1', '160 бит', 'Небезопасен', 'Git коммиты (устаревает)'],
                      ['SHA-256', '256 бит', 'Безопасен', 'TLS, блокчейн, подписи'],
                      ['SHA-512', '512 бит', 'Безопасен', 'Высокая безопасность'],
                      ['bcrypt', '192 бит', 'Безопасен', 'Хеширование паролей'],
                      ['Argon2', 'Переменный', 'Безопасен', 'Конкурс PHC, пароли'],
                    ].map(([name, len, sec, use]) => (
                      <tr key={name} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-mono font-medium">{name}</td>
                        <td className="py-2 pr-4">{len}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary" className={`text-[10px] ${
                            sec === 'Безопасен' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {sec}
                          </Badge>
                        </td>
                        <td className="py-2 text-slate-600">{use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PASSWORD GENERATOR TAB ===== */}
        <TabsContent value="passwords" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Unlock size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold">Генератор паролей</h3>
              </div>
              <p className="text-xs text-slate-500">Генерирует криптографически стойкие пароли с использованием Web Crypto API.</p>

              {/* Generated password display */}
              <div className="bg-slate-900 rounded-xl p-5 flex items-center gap-3">
                <code className={`flex-1 font-mono text-lg break-all ${showPw ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {generatedPassword || 'Нажмите "Сгенерировать"'}
                </code>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <CopyButton text={generatedPassword} />
              </div>

              {/* Length slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Длина пароля</Label>
                  <span className="text-sm font-mono font-bold">{pwLength}</span>
                </div>
                <Slider value={[pwLength]} min={4} max={64} step={1} onValueChange={(v) => setPwLength(v[0])} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'A-Z Заглавные', value: pwUppercase, setter: setPwUppercase },
                  { label: 'a-z Строчные', value: pwLowercase, setter: setPwLowercase },
                  { label: '0-9 Цифры', value: pwNumbers, setter: setPwNumbers },
                  { label: '!@# Символы', value: pwSymbols, setter: setPwSymbols },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => opt.setter(!opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-xs transition-all ${
                      opt.value ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      opt.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {opt.value && <CheckCircle2 size={12} className="text-white" />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={generatePassword}>
                <RefreshCw size={14} className="mr-2" /> Сгенерировать
              </Button>

              {/* Entropy info */}
              {generatedPassword && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <h4 className="text-xs font-semibold text-emerald-700 mb-1">Характеристики пароля</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-600">
                      <span>Длина: {generatedPassword.length} символов</span>
                      <span>Энтропия: ~{Math.round(generatedPassword.length * Math.log2(
                        (pwUppercase ? 26 : 0) + (pwLowercase ? 26 : 0) + (pwNumbers ? 10 : 0) + (pwSymbols ? 32 : 0) || 26
                      ))} бит</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">Менеджеры паролей</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Генерировать пароли недостаточно — их нужно безопасно хранить. Используйте проверенные менеджеры паролей,
                которые шифруют хранилище мастер-паролем:
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Bitwarden', desc: 'Открытый исходный код, бесплатный, кроссплатформенный' },
                  { name: 'KeePassXC', desc: 'Локальное хранение, открытое ПО, плагины для браузеров' },
                  { name: '1Password', desc: 'Коммерческий, отличный UX, семейные планы' },
                ].map((pm) => (
                  <div key={pm.name} className="flex items-start gap-2 bg-slate-50 rounded-lg p-3">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{pm.name}</p>
                      <p className="text-[11px] text-slate-500">{pm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete */}
      {!isCompleted ? (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => completeModule('tools')}>
          Отметить модуль как изученный
        </Button>
      ) : (
        <div className="text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Модуль завершён!
        </div>
      )}
    </div>
  );
}
