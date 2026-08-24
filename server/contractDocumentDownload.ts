import type { Express } from "express";
import { getCentralAccessScope, getContractDocumentForUser } from "./db";
import { storageGetSignedUrl } from "./storage";
import { sdk } from "./_core/sdk";

const isManager = (user: { role: string }) => user.role === "admin";

export function registerContractDocumentDownload(app: Express) {
  app.get("/api/contract-documents/:id/download", async (req, res) => {
    const documentId = Number(req.params.id);
    if (!Number.isSafeInteger(documentId) || documentId <= 0) {
      res.status(400).send("Geçersiz belge isteği");
      return;
    }

    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      res.status(401).send("Belge indirmek için oturum açmalısınız");
      return;
    }

    const scope = await getCentralAccessScope(user.id, isManager(user));
    const document = await getContractDocumentForUser(
      documentId,
      user.id,
      scope.isManager,
      scope.permittedUserIds,
    );
    if (!document) {
      // Belgenin varlığını yetkisiz kullanıcıya açıklama.
      res.status(404).send("Belge bulunamadı");
      return;
    }
    if (document.invalidatedAt && !scope.isManager) {
      res.status(403).send("Bu belge manager tarafından geçersiz kılındı");
      return;
    }

    try {
      const signedUrl = await storageGetSignedUrl(document.storageKey);
      res.set({
        "Cache-Control": "private, no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      });
      res.redirect(307, signedUrl);
    } catch (error) {
      console.error("[ContractDocumentDownload] signed URL error", error);
      res.status(502).send("Belge depolama hizmetine ulaşılamadı");
    }
  });
}
