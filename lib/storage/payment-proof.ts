const PAYMENT_PROOF_BUCKET = "payment-proofs";
const PAYMENT_PROOF_URL_TTL_SECONDS = 60 * 10;

type SignedUrlStorageClient = {
  storage: {
    from(bucket: string): {
      createSignedUrl(path: string, expiresIn: number): Promise<{
        data: { signedUrl: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export function resolveStoredPaymentProofPath(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const normalizeBucketRelativePath = (path: string) => {
    if (path.startsWith(`${PAYMENT_PROOF_BUCKET}/`)) {
      return path.slice(PAYMENT_PROOF_BUCKET.length + 1);
    }

    return path;
  };

  if (!trimmedValue.includes("://") && !trimmedValue.startsWith("/")) {
    return normalizeBucketRelativePath(trimmedValue);
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const bucketMarker = `/${PAYMENT_PROOF_BUCKET}/`;
    const bucketIndex = pathname.indexOf(bucketMarker);

    if (bucketIndex >= 0) {
      const normalizedPath = pathname.slice(bucketIndex + 1);

      if (normalizedPath.startsWith(`${PAYMENT_PROOF_BUCKET}/${PAYMENT_PROOF_BUCKET}/`)) {
        return normalizeBucketRelativePath(
          normalizedPath.slice(PAYMENT_PROOF_BUCKET.length + 1)
        );
      }

      return normalizeBucketRelativePath(normalizedPath);
    }
  } catch {
    return null;
  }

  return null;
}

export async function createPaymentProofReadUrl(
  storageClient: SignedUrlStorageClient,
  storedValue: string | null | undefined
) {
  const storagePath = resolveStoredPaymentProofPath(storedValue);

  if (!storagePath) {
    return null;
  }

  const { data, error } = await storageClient.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(storagePath, PAYMENT_PROOF_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Failed to create payment proof signed URL");
  }

  return data.signedUrl;
}

export function getPaymentProofBucketName() {
  return PAYMENT_PROOF_BUCKET;
}
