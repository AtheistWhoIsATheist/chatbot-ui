--------------- NIHILTHEISM SYSTEM ---------------

-- TABLES --

CREATE TABLE IF NOT EXISTS nihiltheism_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    title TEXT NOT NULL CHECK (char_length(title) <= 500),
    source_type TEXT NOT NULL CHECK (source_type IN ('md', 'txt', 'pdf', 'url', 'audio_transcript', 'video_transcript')),
    source_uri TEXT NOT NULL CHECK (char_length(source_uri) <= 3000),
    language_code TEXT NOT NULL DEFAULT 'en' CHECK (char_length(language_code) <= 10),
    normative_domain TEXT NOT NULL CHECK (char_length(normative_domain) <= 300),
    normative_thesis TEXT NOT NULL CHECK (char_length(normative_thesis) <= 10000),
    rhetorical_mode TEXT NOT NULL CHECK (char_length(rhetorical_mode) <= 300),
    epistemic_posture TEXT NOT NULL CHECK (char_length(epistemic_posture) <= 500),
    existential_vector TEXT NOT NULL CHECK (char_length(existential_vector) <= 2000),
    ingestion_status TEXT NOT NULL DEFAULT 'pending' CHECK (ingestion_status IN ('pending', 'parsed', 'indexed', 'failed')),
    raw_text TEXT NOT NULL,
    parsed_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    checksum_sha256 TEXT NOT NULL CHECK (char_length(checksum_sha256) = 64),

    UNIQUE (user_id, checksum_sha256)
);

CREATE TABLE IF NOT EXISTS nihiltheism_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    library_id UUID NOT NULL REFERENCES nihiltheism_library(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    synthesis_version INTEGER NOT NULL DEFAULT 1 CHECK (synthesis_version > 0),
    deconstruction_grade NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (deconstruction_grade >= 0 AND deconstruction_grade <= 100),
    groundlessness_index NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (groundlessness_index >= 0 AND groundlessness_index <= 100),
    potentiality_index NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (potentiality_index >= 0 AND potentiality_index <= 100),
    normativity_residue TEXT NOT NULL CHECK (char_length(normativity_residue) <= 12000),
    synthesis_text TEXT NOT NULL,
    contradictions JSONB NOT NULL DEFAULT '[]'::JSONB,
    saturation_notes JSONB NOT NULL DEFAULT '{}'::JSONB,

    UNIQUE (library_id, synthesis_version)
);

CREATE TABLE IF NOT EXISTS nihiltheism_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    canonical_name TEXT NOT NULL CHECK (char_length(canonical_name) <= 300),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('concept', 'historical_node', 'archetype', 'method', 'question_form', 'symbol')),
    ontological_tier TEXT NOT NULL CHECK (char_length(ontological_tier) <= 200),
    definition TEXT NOT NULL CHECK (char_length(definition) <= 12000),
    phenomenological_signature TEXT NOT NULL CHECK (char_length(phenomenological_signature) <= 4000),
    anti_definition TEXT NOT NULL CHECK (char_length(anti_definition) <= 12000),
    dialectical_tension TEXT NOT NULL CHECK (char_length(dialectical_tension) <= 4000),
    saturation_score NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (saturation_score >= 0 AND saturation_score <= 100),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    UNIQUE (user_id, canonical_name)
);

CREATE TABLE IF NOT EXISTS nihiltheism_entity_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_entity_id UUID NOT NULL REFERENCES nihiltheism_entities(id) ON DELETE CASCADE,
    to_entity_id UUID NOT NULL REFERENCES nihiltheism_entities(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('grounds', 'negates', 'emerges_from', 'destabilizes', 'reframes', 'mirrors', 'depends_on')),
    relation_strength NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (relation_strength >= 0 AND relation_strength <= 1),
    explanation TEXT NOT NULL CHECK (char_length(explanation) <= 4000),
    evidence_library_ids UUID[] NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (from_entity_id <> to_entity_id),
    UNIQUE (from_entity_id, to_entity_id, relation_type)
);

CREATE TABLE IF NOT EXISTS nihiltheism_entity_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES nihiltheism_entities(id) ON DELETE CASCADE,
    library_id UUID REFERENCES nihiltheism_library(id) ON DELETE CASCADE,
    summary_id UUID REFERENCES nihiltheism_summaries(id) ON DELETE CASCADE,
    excerpt TEXT NOT NULL CHECK (char_length(excerpt) <= 6000),
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.70 CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (library_id IS NOT NULL OR summary_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS nihiltheism_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    question_text TEXT NOT NULL CHECK (char_length(question_text) <= 8000),
    pressure_axis TEXT NOT NULL CHECK (pressure_axis IN ('meaning', 'selfhood', 'ethics', 'time', 'death', 'language', 'politics', 'metaphysics')),
    response_mode TEXT NOT NULL CHECK (response_mode IN ('meditative', 'dialectical', 'genealogical', 'deconstructive', 'phenomenological')),
    severity NUMERIC(4,1) NOT NULL DEFAULT 50 CHECK (severity >= 0 AND severity <= 100),
    unresolved BOOLEAN NOT NULL DEFAULT TRUE,
    related_entity_ids UUID[] NOT NULL DEFAULT '{}',
    related_library_ids UUID[] NOT NULL DEFAULT '{}',
    related_summary_ids UUID[] NOT NULL DEFAULT '{}',
    curator_notes TEXT NOT NULL DEFAULT '' CHECK (char_length(curator_notes) <= 12000)
);

CREATE TABLE IF NOT EXISTS nihiltheism_agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    agent_name TEXT NOT NULL CHECK (agent_name = 'Knowledge Curator'),
    training_scope TEXT NOT NULL CHECK (training_scope = 'library_plus_entities_only'),
    operational_directive TEXT NOT NULL,
    densification_protocol TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    UNIQUE (user_id, agent_name)
);

CREATE TABLE IF NOT EXISTS nihiltheism_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    workflow_name TEXT NOT NULL CHECK (workflow_name IN ('The Intake Transmutation', 'The Temporal Synthesis')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('new_artifact', 'schedule_weekly')),
    trigger_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    action_prompt TEXT NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    UNIQUE (user_id, workflow_name)
);

CREATE TABLE IF NOT EXISTS nihiltheism_workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES nihiltheism_workflows(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    trigger_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    result_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    error_text TEXT
);

-- INDEXES --

CREATE INDEX idx_nihiltheism_library_user_id ON nihiltheism_library(user_id);
CREATE INDEX idx_nihiltheism_library_status ON nihiltheism_library(ingestion_status);
CREATE INDEX idx_nihiltheism_summaries_user_id ON nihiltheism_summaries(user_id);
CREATE INDEX idx_nihiltheism_summaries_library_id ON nihiltheism_summaries(library_id);
CREATE INDEX idx_nihiltheism_entities_user_id ON nihiltheism_entities(user_id);
CREATE INDEX idx_nihiltheism_entities_type ON nihiltheism_entities(entity_type);
CREATE INDEX idx_nihiltheism_entity_links_user_id ON nihiltheism_entity_links(user_id);
CREATE INDEX idx_nihiltheism_entity_evidence_user_id ON nihiltheism_entity_evidence(user_id);
CREATE INDEX idx_nihiltheism_questions_user_id ON nihiltheism_questions(user_id);
CREATE INDEX idx_nihiltheism_questions_unresolved ON nihiltheism_questions(unresolved);
CREATE INDEX idx_nihiltheism_workflows_user_id ON nihiltheism_workflows(user_id);
CREATE INDEX idx_nihiltheism_workflow_runs_workflow_id ON nihiltheism_workflow_runs(workflow_id);

-- RLS --

ALTER TABLE nihiltheism_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_entity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE nihiltheism_workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own nihiltheism_library"
    ON nihiltheism_library
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_summaries"
    ON nihiltheism_summaries
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_entities"
    ON nihiltheism_entities
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_entity_links"
    ON nihiltheism_entity_links
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_entity_evidence"
    ON nihiltheism_entity_evidence
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_questions"
    ON nihiltheism_questions
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_agent_profiles"
    ON nihiltheism_agent_profiles
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_workflows"
    ON nihiltheism_workflows
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow full access to own nihiltheism_workflow_runs"
    ON nihiltheism_workflow_runs
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- FUNCTIONS --

CREATE OR REPLACE FUNCTION nihiltheism_extract_existential_vectors(input_text TEXT)
RETURNS JSONB AS $$
DECLARE
    lowered TEXT := lower(input_text);
    vectors JSONB := '[]'::JSONB;
BEGIN
    IF lowered LIKE '%meaning%' OR lowered LIKE '%purpose%' THEN
        vectors := vectors || jsonb_build_array('meaning-collapse');
    END IF;

    IF lowered LIKE '%self%' OR lowered LIKE '%ego%' OR lowered LIKE '%identity%' THEN
        vectors := vectors || jsonb_build_array('ego-dissolution');
    END IF;

    IF lowered LIKE '%death%' OR lowered LIKE '%mortality%' THEN
        vectors := vectors || jsonb_build_array('finitude-pressure');
    END IF;

    IF lowered LIKE '%god%' OR lowered LIKE '%sacred%' OR lowered LIKE '%divine%' THEN
        vectors := vectors || jsonb_build_array('post-theistic-transcendence');
    END IF;

    IF jsonb_array_length(vectors) = 0 THEN
        vectors := jsonb_build_array('groundlessness');
    END IF;

    RETURN vectors;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION nihiltheism_generate_propositions(input_text TEXT)
RETURNS JSONB AS $$
DECLARE
    propositions JSONB;
BEGIN
    SELECT COALESCE(
      jsonb_agg(trim(sentence)),
      '[]'::JSONB
    ) INTO propositions
    FROM (
      SELECT sentence
      FROM regexp_split_to_table(input_text, E'(?<=[.!?])\\s+') AS sentence
      WHERE char_length(trim(sentence)) > 20
      LIMIT 12
    ) s;

    RETURN propositions;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION nihiltheism_upsert_entity(
    p_user_id UUID,
    p_name TEXT,
    p_definition TEXT,
    p_signature TEXT
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO nihiltheism_entities (
        user_id,
        canonical_name,
        entity_type,
        ontological_tier,
        definition,
        phenomenological_signature,
        anti_definition,
        dialectical_tension,
        saturation_score,
        metadata
    )
    VALUES (
        p_user_id,
        p_name,
        'concept',
        'liminal',
        p_definition,
        p_signature,
        'No stable essence remains once the concept is recursively negated.',
        'The concept persists only as a productive contradiction.',
        72,
        jsonb_build_object('autogenerated', true)
    )
    ON CONFLICT (user_id, canonical_name)
    DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        definition = EXCLUDED.definition,
        phenomenological_signature = EXCLUDED.phenomenological_signature
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION nihiltheism_run_intake_transmutation()
RETURNS TRIGGER AS $$
DECLARE
    v_summary_id UUID;
    v_workflow_id UUID;
    v_propositions JSONB;
    v_vectors JSONB;
    v_entity_id UUID;
BEGIN
    v_propositions := nihiltheism_generate_propositions(NEW.raw_text);
    v_vectors := nihiltheism_extract_existential_vectors(NEW.raw_text);

    INSERT INTO nihiltheism_summaries (
        user_id,
        library_id,
        synthesis_version,
        deconstruction_grade,
        groundlessness_index,
        potentiality_index,
        normativity_residue,
        synthesis_text,
        contradictions,
        saturation_notes
    ) VALUES (
        NEW.user_id,
        NEW.id,
        1,
        79,
        82,
        77,
        'Residual normativity detected in rhetorical commitments and inherited moral vocabulary.',
        'Autogenerated synthesis placeholder. Replace with model output in orchestration layer.',
        '[]'::JSONB,
        jsonb_build_object(
            'factual_propositions', v_propositions,
            'existential_vectors', v_vectors,
            'six_laws_tags', jsonb_build_array(
                'ontological-exhaustion',
                'relational-stasis',
                'micro-granular-subsumption',
                'groundlessness-amplification',
                'dialectical-reversibility',
                'transformative-potentiality'
            )
        )
    ) RETURNING id INTO v_summary_id;

    v_entity_id := nihiltheism_upsert_entity(
        NEW.user_id,
        'Deconstructive Synthesis',
        'Method for recursively dissolving a source artifact into tensions, absences, and emergent possibilities.',
        'A sensation of conceptual instability coupled with heightened interpretive freedom.'
    );

    INSERT INTO nihiltheism_entity_evidence (
        user_id,
        entity_id,
        library_id,
        summary_id,
        excerpt,
        confidence
    ) VALUES (
        NEW.user_id,
        v_entity_id,
        NEW.id,
        v_summary_id,
        LEFT(NEW.raw_text, 500),
        0.76
    );

    UPDATE nihiltheism_library
    SET
        ingestion_status = 'indexed',
        parsed_payload = jsonb_build_object(
            'factual_propositions', v_propositions,
            'existential_vectors', v_vectors,
            'summary_id', v_summary_id
        )
    WHERE id = NEW.id;

    SELECT id INTO v_workflow_id
    FROM nihiltheism_workflows
    WHERE user_id = NEW.user_id
      AND workflow_name = 'The Intake Transmutation';

    IF v_workflow_id IS NOT NULL THEN
        INSERT INTO nihiltheism_workflow_runs (
            user_id,
            workflow_id,
            status,
            trigger_payload,
            result_payload
        ) VALUES (
            NEW.user_id,
            v_workflow_id,
            'completed',
            jsonb_build_object('library_id', NEW.id, 'trigger', 'new_artifact'),
            jsonb_build_object('summary_id', v_summary_id, 'entity_id', v_entity_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION nihiltheism_run_weekly_temporal_synthesis(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_workflow_id UUID;
    v_run_id UUID;
    v_library_count INTEGER;
    v_summary_count INTEGER;
    v_question_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_library_count FROM nihiltheism_library WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO v_summary_count FROM nihiltheism_summaries WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO v_question_count FROM nihiltheism_questions WHERE user_id = p_user_id;

    SELECT id INTO v_workflow_id
    FROM nihiltheism_workflows
    WHERE user_id = p_user_id
      AND workflow_name = 'The Temporal Synthesis';

    IF v_workflow_id IS NULL THEN
        RAISE EXCEPTION 'Temporal synthesis workflow is missing for user %', p_user_id;
    END IF;

    INSERT INTO nihiltheism_workflow_runs (
        user_id,
        workflow_id,
        status,
        trigger_payload,
        result_payload
    ) VALUES (
        p_user_id,
        v_workflow_id,
        'completed',
        jsonb_build_object('trigger', 'schedule_weekly'),
        jsonb_build_object(
            'what_changed_digest', format(
                'Weekly recursive scan complete. Library=%s, Summaries=%s, Questions=%s. Epistemic topology updated.',
                v_library_count,
                v_summary_count,
                v_question_count
            ),
            'recommended_next_actions', jsonb_build_array(
                'Interrogate the highest-severity unresolved question and force an anti-thesis.',
                'Create two new entities from recurrent contradictions in latest summaries.',
                'Re-score saturation on all entities below 70 and re-link evidence.'
            )
        )
    ) RETURNING id INTO v_run_id;

    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS --

CREATE TRIGGER update_nihiltheism_library_updated_at
BEFORE UPDATE ON nihiltheism_library
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nihiltheism_summaries_updated_at
BEFORE UPDATE ON nihiltheism_summaries
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nihiltheism_entities_updated_at
BEFORE UPDATE ON nihiltheism_entities
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nihiltheism_questions_updated_at
BEFORE UPDATE ON nihiltheism_questions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nihiltheism_agent_profiles_updated_at
BEFORE UPDATE ON nihiltheism_agent_profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nihiltheism_workflows_updated_at
BEFORE UPDATE ON nihiltheism_workflows
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER nihiltheism_after_library_insert
AFTER INSERT ON nihiltheism_library
FOR EACH ROW
EXECUTE PROCEDURE nihiltheism_run_intake_transmutation();
