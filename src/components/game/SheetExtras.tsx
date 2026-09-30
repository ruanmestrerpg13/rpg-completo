import { useState } from 'react';
import { Dices, Plus, Skull, Sparkles, Swords, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stepper } from './Controls';
import {
  ATTR_LABEL, NOMENCLATURE_LABEL, NOMENCLATURE_RANGES, WEAPONS, attackRoll, cappedNomenclatureDice, cappedWeaponDice,
  damageRoll, dieFor, karmaDamageBonus, karmaMaximum, rollDice, weaponAttrFor, weaponByKey,
  type Character, type NomenclatureKind,
} from '@/lib/game';

export type RollEntry = { expression: string; dice: number[]; modifier: number; total: number; source?: string; crit?: boolean };
type Update = (partial: Partial<Character>) => void;
type AddRoll = (entry: RollEntry) => void;

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span className="field-label">{label}</span>{children}</label>; }

/** 1.3 Sincronia — Nível: vínculos com nome e nível, abaixo de GS. */
export function SyncEditor({ character, update }: { character: Character; update: Update }) {
  return <div className="sync-block">
    <div className="flex items-center justify-between"><span className="field-kicker">SINCRONIA — NÍVEL</span><Button size="sm" variant="outline" onClick={() => update({ sync: [...character.sync, { name: '', level: 1 }] })}><Plus /> Adicionar sincronia</Button></div>
    {character.sync.map((item, i) => <div className="sync-row" key={i}>
      <Field label="COM QUEM"><input value={item.name} placeholder="Nome da pessoa" onChange={e => update({ sync: character.sync.map((n, j) => j === i ? { ...n, name: e.target.value } : n) })} /></Field>
      <Stepper label="NÍVEL" value={item.level} onChange={level => update({ sync: character.sync.map((n, j) => j === i ? { ...n, level } : n) })} />
      <Button size="icon" variant="ghost" title="Remover sincronia" aria-label="Remover sincronia" onClick={() => update({ sync: character.sync.filter((_, j) => j !== i) })}><Trash2 /></Button>
    </div>)}
    {!character.sync.length && <p className="empty-copy">Nenhuma sincronia registrada.</p>}
  </div>;
}

/** 1.1 Passiva do Gaki: absorver Fluxo ao final do combate + Teste de Mente para Karma. */
export function GakiPassive({ character, update, addRoll }: { character: Character; update: Update; addRoll: AddRoll }) {
  const [defeated, setDefeated] = useState(1);
  const [dt, setDt] = useState(10);
  const [karmaGain, setKarmaGain] = useState(1);
  const [heal, setHeal] = useState<{ dice: number[]; total: number } | null>(null);
  const [test, setTest] = useState<{ roll: number; dt: number; success: boolean } | null>(null);
  const kMax = karmaMaximum(character.mente, character.espirito);
  return <div className="passive">
    <span className="field-kicker">PASSIVA DE LINHAGEM · GAKI</span>
    <p>Ao final de um combate, o Gaki pode absorver o Fluxo restante dos alvos com os quais interagiu. Para cada alvo derrotado, recupera 1d4 PV. Ao consumir esse Fluxo, faz um Teste de Mente para verificar se acumula Karma.</p>
    <div className="gaki-grid">
      <Stepper label="ALVOS DERROTADOS" value={defeated} min={0} max={30} onChange={setDefeated} />
      <Button variant="outline" disabled={defeated < 1} onClick={() => {
        const dice = rollDice(defeated, 4); const total = dice.reduce((a, b) => a + b, 0);
        setHeal({ dice, total }); setTest(null);
        update({ pv_current: Math.min(character.pv_max, character.pv_current + total) });
        addRoll({ expression: `${defeated}d4`, dice, modifier: 0, total, source: `Absorver Fluxo (+${total} PV)` });
      }}><Sparkles /> Absorver Fluxo ({defeated}d4 PV)</Button>
    </div>
    {heal && <div className="roll-result"><span>Recuperou <strong>{heal.total} PV</strong> ({heal.dice.join(' + ')})</span></div>}
    {heal && <div className="gaki-grid">
      <Stepper label="DT DO TESTE (MESTRE)" value={dt} min={1} max={40} onChange={setDt} />
      <Button variant="outline" onClick={() => {
        const r = rollDice(1, dieFor(character.mente) ?? 4)[0]!; const success = r >= dt;
        setTest({ roll: r, dt, success });
        addRoll({ expression: `1d${dieFor(character.mente)}`, dice: [r], modifier: 0, total: r, source: `Teste de Mente (DT ${dt}) — ${success ? 'sem Karma' : 'acumula Karma'}` });
      }}><Dices /> Teste de Mente (1d{dieFor(character.mente)})</Button>
    </div>}
    {test && <div className={`combat-banner ${test.success ? 'banner-hit' : 'banner-miss'}`}>
      <strong>{test.success ? 'SUCESSO — NÃO ACUMULA KARMA' : 'FALHA — ACUMULA KARMA'}</strong>
      <span>Resultado {test.roll} contra DT {test.dt}</span>
      {!test.success && <div className="gaki-grid mt-3">
        <Stepper label="KARMA ACUMULADO (MESTRE)" value={karmaGain} min={1} max={kMax} tone="karma" onChange={setKarmaGain} />
        <Button variant="outline" onClick={() => { update({ karma: Math.min(kMax, character.karma + karmaGain) }); setTest(null); setHeal(null); }}><Skull /> Registrar Karma</Button>
      </div>}
    </div>}
  </div>;
}

/** 1.2 Arma: modelo, tipo e dano exatamente da tabela de Dano base. Humanos atacam com MENTE. */
export function WeaponPanel({ character, update, addRoll }: { character: Character; update: Update; addRoll: AddRoll }) {
  const [last, setLast] = useState<{ d20: number; total: number; crit: boolean } | null>(null);
  const [dmg, setDmg] = useState<{ total: number; dice: number[]; bonus: number; crit: boolean } | null>(null);
  const type = weaponByKey(character.weapon_type);
  const dice = type ? cappedWeaponDice(type.key, character.weapon_dice)! : '';
  const attr = weaponAttrFor(character.lineage);
  const hitAttr = type?.attr === 'corpo' ? 'corpo' : attr;
  const damageAttr = type?.attr === 'corpo' ? 'corpo' : type?.attr === 'atributo' ? attr : null;
  const bonus = (damageAttr ? character[damageAttr] : 0) + karmaDamageBonus(character);
  return <div className="weapon-block">
    <span className="field-kicker">{character.lineage === 'Humano' ? 'ARMA DE VÍNCULO · VONTADE, HISTÓRIA E IDENTIDADE' : 'ARMA'}</span>
    <div className="input-grid mt-3">
      <Field label="TIPO DE ARMA"><select value={character.weapon_type} onChange={e => { const w = weaponByKey(e.target.value); update({ weapon_type: e.target.value, weapon_dice: w?.dice[0] ?? '' }); }}>
        <option value="">Escolher tipo</option>{WEAPONS.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
      </select></Field>
      <Field label="DANO (TABELA)"><select disabled={!type} value={dice} onChange={e => update({ weapon_dice: e.target.value })}>
        {(type?.dice ?? []).map(d => <option key={d}>{d}</option>)}
      </select></Field>
    </div>
    {type && <p className="weapon-summary">Ataque <strong>1d20 + {ATTR_LABEL[hitAttr]} ({character[hitAttr]})</strong> · Dano <strong>{dice}{damageAttr ? ` + ${ATTR_LABEL[damageAttr]} (${character[damageAttr]})` : ''}{karmaDamageBonus(character) ? ` + ${karmaDamageBonus(character)} Karma` : ''}</strong><br /><span>{type.note}</span></p>}
    <div className="quick-actions mt-3">
      <Button variant="outline" disabled={!type} onClick={() => {
        const r = attackRoll(character[hitAttr]); setLast({ d20: r.d20, total: r.total, crit: r.crit }); setDmg(null);
        addRoll({ expression: `1d20 + ${character[hitAttr]}`, dice: [r.d20], modifier: character[hitAttr], total: r.total, source: `Ataque com arma${r.crit ? ' — CRÍTICO' : ''}`, crit: r.crit });
      }}><Swords /> Atacar (1d20 + {ATTR_LABEL[hitAttr]})</Button>
      <Button variant="outline" disabled={!type || !last} onClick={() => {
        const d = damageRoll(dice, bonus, !!last?.crit); setDmg({ total: d.total, dice: d.dice, bonus, crit: !!last?.crit });
        addRoll({ expression: d.expression, dice: d.dice, modifier: bonus, total: d.total, source: `Dano da arma${last?.crit ? ' — CRÍTICO (dados dobrados)' : ''}`, crit: !!last?.crit });
      }}><Dices /> Rolar dano{last?.crit ? ' crítico' : ''}</Button>
    </div>
    {last && <div className={`combat-banner ${last.crit ? 'banner-crit' : 'banner-neutral'}`}><strong>{last.crit ? 'CRÍTICO! 20 NATURAL' : `ATAQUE: ${last.total}`}</strong><span>d20 = {last.d20} · total {last.total}{last.crit ? ' · confirma se superar a Esquiva do alvo; dados de dano dobrados' : ' · compare com a Esquiva do alvo'}</span></div>}
    {dmg && <div className="roll-result"><span>Dano{dmg.crit ? ' CRÍTICO' : ''}: <strong>{dmg.total}</strong> ({dmg.dice.join(' + ')}{dmg.bonus ? ` + ${dmg.bonus}` : ''})</span></div>}
  </div>;
}

/** 1.4 Nomenclaturas: nome, custo de PF, tipo e dano dentro da faixa da regra. */
export function NomenclaturesTab({ character, update, addRoll }: { character: Character; update: Update; addRoll: AddRoll }) {
  const [draft, setDraft] = useState<{ name: string; cost: number; kind: NomenclatureKind; dice: number } | null>(null);
  const [result, setResult] = useState<{ name: string; attack: number; d20: number; crit: boolean; damage?: number; dice?: number[] } | null>(null);
  return <div className="single-section">
    <div className="section-heading"><div className="flex items-center gap-3"><span className="section-number">01</span><h2>Nomenclaturas</h2></div><Button size="sm" onClick={() => setDraft({ name: '', cost: 0, kind: 'Direta', dice: 1 })}><Plus /> Nova Nomenclatura</Button></div>
    {draft && <div className="game-panel mb-5">
      <div className="panel-head"><h3>Nova Nomenclatura</h3></div>
      <div className="field-stack">
        <Field label="NOME DA TÉCNICA"><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Nome da técnica" /></Field>
        <div className="input-grid">
          <Stepper label="CUSTO DE PF" value={draft.cost} max={999} tone="flux" onChange={cost => setDraft({ ...draft, cost })} />
          <Field label="TIPO DE NOMENCLATURA"><select value={draft.kind} onChange={e => { const kind = e.target.value as NomenclatureKind; setDraft({ ...draft, kind, dice: NOMENCLATURE_RANGES[kind][0]! }); }}>
            {(Object.keys(NOMENCLATURE_RANGES) as NomenclatureKind[]).map(k => <option key={k} value={k}>{NOMENCLATURE_LABEL[k]}</option>)}
          </select></Field>
        </div>
        <Field label="DANO"><select value={draft.dice} onChange={e => setDraft({ ...draft, dice: Number(e.target.value) })}>{NOMENCLATURE_RANGES[draft.kind].map(n => <option key={n} value={n}>{n}d8</option>)}</select></Field>
        <div className="flex gap-2"><Button disabled={!draft.name.trim()} onClick={() => { update({ nomenclatures: [...character.nomenclatures, { name: draft.name.trim(), cost: draft.cost, kind: draft.kind, dice: cappedNomenclatureDice(draft.kind, draft.dice) }] }); setDraft(null); }}><Plus /> Salvar técnica</Button><Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button></div>
      </div>
    </div>}
    {result && <div className={`combat-banner mb-5 ${result.crit ? 'banner-crit' : 'banner-neutral'}`}><strong>{result.crit ? `CRÍTICO! ${result.name}` : `${result.name}: ataque ${result.attack}`}</strong><span>d20 = {result.d20} + ESPÍRITO{result.damage !== undefined ? ` · dano ${result.damage} (${result.dice?.join(' + ')})${result.crit ? ' — dados dobrados' : ''}` : ''}</span></div>}
    <div className="item-list">{character.nomenclatures.map((item, i) => {
      const kind = item.kind ?? 'Direta'; const n = cappedNomenclatureDice(kind, item.dice);
      return <div className="editable-row" key={i}>
        <div className="nomen-head"><strong>{item.name}</strong><span>{kind} · {n}d8 · {item.cost} PF</span></div>
        {item.effect && <p className="empty-copy">{item.effect}</p>}
        <div className="row-actions">
          <Button size="sm" variant="outline" disabled={character.pf_current < item.cost} onClick={() => {
            const r = attackRoll(character.espirito); update({ pf_current: character.pf_current - item.cost });
            setResult({ name: item.name, attack: r.total, d20: r.d20, crit: r.crit });
            addRoll({ expression: `1d20 + ${character.espirito}`, dice: [r.d20], modifier: character.espirito, total: r.total, source: `${item.name} — acerto${r.crit ? ' CRÍTICO' : ''}`, crit: r.crit });
          }}><Sparkles /> Usar ({item.cost} PF)</Button>
          <Button size="sm" variant="outline" disabled={!result || result.name !== item.name || result.damage !== undefined} onClick={() => {
            if (!result) return; const d = damageRoll(`${n}d8`, karmaDamageBonus(character), result.crit);
            setResult({ ...result, damage: d.total, dice: d.dice });
            addRoll({ expression: d.expression, dice: d.dice, modifier: d.bonus, total: d.total, source: `${item.name} — dano${result.crit ? ' CRÍTICO' : ''}`, crit: result.crit });
          }}><Dices /> Rolar dano</Button>
          <Button size="icon" variant="ghost" title="Excluir técnica" aria-label="Excluir técnica" onClick={() => update({ nomenclatures: character.nomenclatures.filter((_, j) => j !== i) })}><Trash2 /></Button>
        </div>
      </div>;
    })}{!character.nomenclatures.length && <p className="empty-copy">Ainda não há nomenclaturas nesta ficha.</p>}</div>
  </div>;
}

/** 1.5 Habilidades: apenas nome e descrição. */
export function AbilitiesTab({ character, update }: { character: Character; update: Update }) {
  const [draft, setDraft] = useState<{ name: string; description: string } | null>(null);
  return <div className="single-section">
    <div className="section-heading"><div className="flex items-center gap-3"><span className="section-number">02</span><h2>Habilidades</h2></div><Button size="sm" onClick={() => setDraft({ name: '', description: '' })}><Plus /> Nova Habilidade</Button></div>
    {draft && <div className="game-panel mb-5"><div className="panel-head"><h3>Nova Habilidade</h3></div><div className="field-stack">
      <Field label="NOME DA HABILIDADE"><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></Field>
      <Field label="O QUE A HABILIDADE FAZ"><textarea rows={4} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></Field>
      <div className="flex gap-2"><Button disabled={!draft.name.trim()} onClick={() => { update({ abilities: [...character.abilities, { name: draft.name.trim(), description: draft.description.trim() }] }); setDraft(null); }}><Plus /> Salvar habilidade</Button><Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button></div>
    </div></div>}
    <div className="item-list">{character.abilities.map((a, i) => <div className="editable-row" key={i}>
      <Field label="NOME"><input value={a.name} onChange={e => update({ abilities: character.abilities.map((n, j) => j === i ? { ...n, name: e.target.value } : n) })} /></Field>
      <Field label="DESCRIÇÃO"><textarea rows={3} value={a.description} onChange={e => update({ abilities: character.abilities.map((n, j) => j === i ? { ...n, description: e.target.value } : n) })} /></Field>
      <div className="row-actions"><Button size="icon" variant="ghost" title="Excluir habilidade" aria-label="Excluir habilidade" onClick={() => update({ abilities: character.abilities.filter((_, j) => j !== i) })}><Trash2 /></Button></div>
    </div>)}{!character.abilities.length && <p className="empty-copy">Nenhuma habilidade registrada.</p>}</div>
  </div>;
}
