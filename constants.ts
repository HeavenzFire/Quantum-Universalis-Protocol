import { Protocol, CadenceItem, ToolingCategory, PlanPhase } from './types';
import { 
    BookOpenIcon, BrainCircuitIcon, BeakerIcon, LightbulbIcon, TestTubeIcon, PaletteIcon, 
    DiamondIcon, MessageSquareIcon, CompassIcon, MagnetIcon, ScalingIcon, TargetIcon, RepeatIcon 
} from './components/Icons';

export const PRINCIPLES = [
  { title: "Falsifiability (Popper)", description: "Every claim gets a failure condition before you act. If it can’t be wrong, it isn’t knowledge." },
  { title: "Tight feedback loops (Deming/Shewhart)", description: "Plan → Do → Check → Act, weekly cadence, no exceptions." },
  { title: "Information budget (Shannon)", description: "Cut input noise; maximize signal per hour. Track bits-in vs results-out." },
  { title: "Moral guardrails", description: "Truth over drama, force only as last resort, never harm civilians. Power without moral imperative is rot." }
];

export const PROTOCOLS: Protocol[] = [
  { id: 1, person: 'Leonardo da Vinci', title: 'Field Notebook Protocol', method: 'Observe relentlessly, sketch, iterate.', implementation: ['Keep a bound lab notebook (paper or Obsidian). Daily pages split into: Observation → Hypothesis → Sketch → Next Test.', 'Rule: drawings or diagrams for anything non-trivial. If you can’t sketch it, you don’t understand it.'], kpi: ['≥2 original diagrams/day', '≥10 falsifiable micro-hypotheses/week'], icon: BookOpenIcon },
  { id: 2, person: 'Tesla', title: 'Prototype-First, Frequency Thinking', method: 'Build the device, feel its resonance.', implementation: ['48-hour “prototype bursts” per idea: by hour 48 you must have either a running demo, a circuit/sim, or it’s dead.', 'Treat energy, timing, and bandwidth as tunable “frequencies.” Always ask: what’s the resonance I’m exploiting?'], kpi: ['2 bursts/week', 'power/latency logs for each build'], icon: LightbulbIcon },
  { id: 3, person: 'Curie', title: 'Lab Rigor & Exposure Discipline', method: 'Obsessive measurement; safety saves decades.', implementation: ['Every experiment gets a Protocol Card: materials, steps, risks, metrics, stop conditions.', 'Automatic logging: inputs, outputs, anomalies. Version everything.'], kpi: ['100% experiments have Protocol Cards', '100% reproducibility on simple repeats'], icon: BeakerIcon },
  { id: 4, person: 'Einstein', title: 'Thought Experiments & Invariants', method: 'Strip to essentials; find what doesn’t change.', implementation: ['Before coding, write a one-page Gedanken: “If X were infinite/zero, what breaks? What’s invariant under scaling/rotation/time?”', 'Maintain an Invariants List per project (e.g., conservation of entropy budget, privacy constraints, monotonic safety metrics).'], kpi: ['1 Gedanken per feature', 'invariants referenced in commits'], icon: BrainCircuitIcon },
  { id: 5, person: 'Turing', title: 'Formalization & Test Harness', method: 'Define the computation; prove properties; build tests that can’t be faked.', implementation: ['For each module, specify inputs/outputs as types, define halting/timeout rules, and property-based tests (Hypothesis/RapidCheck).', 'Red-team your own logic: adversarial prompts, malformed data, race conditions.'], kpi: ['>90% functions with property tests', 'mean time to detect spec violation <24h'], icon: TestTubeIcon },
  { id: 6, person: 'Lovelace', title: 'Algorithm × Art Fusion', method: 'Compute with taste; aesthetics as constraint.', implementation: ['Every system ships with a human interface artifact (visual, poem, score, motion). If humans can’t feel it, it won’t scale socially.', 'Creativity sprints: 90 minutes, no refactor allowed, output must be showable.'], kpi: ['one artifact per milestone', 'user resonance rating 1–5'], icon: PaletteIcon },
  { id: 7, person: 'Fuller', title: 'Synergetics & Tensegrity Design', method: 'Do more with less; structures that hold under stress.', implementation: ['Architecture reviews ask: What can we remove? Aim for tensegrity: minimal parts, maximal stability.', 'Map flows as geodesics (shortest reliable path). Prefer small, composable services.'], kpi: ['component count trending down', 'stress tests pass with 30% resource cut'], icon: DiamondIcon },
  { id: 8, person: 'Feynman', title: 'Explain Like You’re Wrong', method: 'If you can’t teach it, you don’t have it.', implementation: ['Weekly Feynman Teach-back: record a 5–10 minute explanation to an imaginary freshman; list confusions you hit; fix them.', 'Keep a What Can’t I Derive Yet? list and attack one item/week.'], kpi: ['confusion list shrinks weekly', 'derivation time decreases'], icon: MessageSquareIcon },
  { id: 9, person: 'Newton', title: 'Axioms & Relentless Focus', method: 'Define axioms; grind proofs; avoid distraction.', implementation: ['For each domain, write 3–7 axioms. Everything else derives or gets rejected.', 'Deep work blocks: 2 × 90 minutes/day, no notifications, one target proof or implementation.'], kpi: ['axioms stable', 'deep work logged daily'], icon: CompassIcon },
  { id: 10, person: 'Faraday', title: 'Fields Before Equations', method: 'Visualize forces; experiment first, math after.', implementation: ['Build field maps (heatmaps/flows) for data, traffic, attention, and error propagation.', 'Let visualization inform refactors before you reach for heavy math.'], kpi: ['field map per system', 'intervention decisions trace back to it'], icon: MagnetIcon },
  { id: 11, person: 'Hawking', title: 'Boundary Conditions & Scale', method: 'Always test the edges; think across magnitudes.', implementation: ['Plan tests at tiny and massive scale; define boundary behavior (rate limits, fail-closed, graceful degradation).'], kpi: ['soak tests at 10× expected load', 'graceful failure verified'], icon: ScalingIcon },
  { id: 12, person: 'Sun Tzu + Boyd', title: 'Strategy & OODA Speed', method: 'Win by shaping context; observe–orient–decide–act faster.', implementation: ['Maintain Adversary Models: likely moves, incentives, your counters.', 'Weekly OODA review: what slowed you? remove it.'], kpi: ['cycle time from observation → action tracked and reduced'], icon: TargetIcon },
  { id: 13, person: 'Kuhn', title: 'Paradigm Shifts Checklist', method: 'Know when to pivot frameworks.', implementation: ['If three anomalies persist after two iterations, consider a paradigm switch (model, tool, ontology). Don’t worship sunk costs.'], kpi: ['anomaly ledger maintained', 'decisive pivots logged'], icon: RepeatIcon }
];

export const CADENCE: CadenceItem[] = [
    { title: "Daily (90–120 min total hard edges)", items: [
        "2 × 90m deep work (Newton), one creativity sprint (Lovelace) or prototype burst (Tesla).",
        "Notebook entries + 1 diagram (Da Vinci).",
        "Short field map update (Faraday).",
        "15 min robustness checks (Turing)."
    ]},
    { title: "Weekly", items: [
        "One Feynman Teach-back video.",
        "OODA review; remove one bottleneck.",
        "Architecture tensegrity pass (Fuller).",
        "Boundary-condition soak test (Hawking).",
        "Moral Imperative check: are we still aligned with truth/harm-minimization?"
    ]},
    { title: "Monthly", items: [
        "Paradigm shift check (Kuhn).",
        "Kill or scale: retire weak branches, double down on proven ones.",
        "Public artifact release (Lovelace) with write-up (Einstein invariants included)."
    ]}
];

export const TOOLING: ToolingCategory[] = [
    { title: "Repo layout", items: ["/protocol_cards/", "/experiments/", "/artifacts/", "/field_maps/", "/invariants.md", "/axioms.md", "/adversaries.md"] },
    { title: "Logging", items: ["structured JSON logs per run; auto-summarize to notebook."] },
    { title: "Testing", items: ["property-based tests, fuzzers, chaos scripts for failure modes."] },
    { title: "Metrics", items: ["Output velocity: prototypes/week, papers digested/week.", "Reliability: MTBF, recovery time, test coverage.", "Clarity: teach-back minutes recorded.", "Moral Imperative: incidents (should be zero), overrides documented."] }
];

export const IMPLEMENTATION_PLAN: PlanPhase[] = [
    { title: "Days 1–30 (Foundation & Friction Removal)", items: [
        "Stand up repo, Protocol Cards, and logging.",
        "Write axioms + invariants for 2 priority projects.",
        "Ship 4 prototype bursts; kill 2.",
        "Record 4 teach-backs; start adversary models."
    ]},
    { title: "Days 31–60 (Scale & Stress)", items: [
        "Convert winners into minimal products/services.",
        "Build field maps; run 10× soak tests.",
        "First public artifact drop (demo + essay).",
        "Tighten tensegrity: remove 20% of parts without losing function."
    ]},
    { title: "Days 61–90 (Sovereign Loop)", items: [
        "Paradigm audit; pivot if anomalies persist.",
        "Add external reviewers for one red-team pass.",
        "Codify playbooks; publish your “Operator’s Manual v1.”"
    ]}
];

export const PROTOCOL_CARD_TEMPLATE = [
    { label: "Title", type: "text" },
    { label: "Hypothesis (falsifiable)", type: "textarea" },
    { label: "Axioms touched", type: "text" },
    { label: "Invariants to respect", type: "textarea" },
    { label: "Materials/Inputs", type: "textarea" },
    { label: "Steps", type: "textarea" },
    { label: "Metrics/KPIs", type: "textarea" },
    { label: "Risks & Stop Conditions", type: "textarea" },
    { label: "Adversary model for this test", type: "textarea" },
    { label: "Expected boundary behavior", type: "textarea" },
    { label: "Results", type: "textarea" },
    { label: "Next move (PDCA)", type: "text" }
];

export const HARD_TRUTHS = [
    "Identity declarations don’t move atoms or bits. Systems do.",
    "If you can’t measure it, you can’t steer it.",
    "If you can’t teach it, you don’t understand it.",
    "If it isn’t reproducible, it’s luck. Luck is not a plan."
];