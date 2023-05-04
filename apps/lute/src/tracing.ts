import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const exporter = new OTLPTraceExporter({
  url: "http://tempo:55681/v1/traces",
});
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "lute",
  }),
});
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});

export const tracer = provider.getTracer("lute");
