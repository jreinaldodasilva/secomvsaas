import { EventBus } from '../../../src/platform/events/eventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('should call registered handler when event is emitted', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.on('test.event', handler);

    await bus.emit('test.event', { key: 'value' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'test.event',
        payload: { key: 'value' },
      })
    );
  });

  it('should call wildcard handlers for any event', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.on('*', handler);

    await bus.emit('any.event', { data: 1 });
    await bus.emit('another.event', { data: 2 });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should not fail if no handlers are registered', async () => {
    await expect(bus.emit('no.handlers', {})).resolves.not.toThrow();
  });

  it('should continue processing if a handler throws', async () => {
    const failHandler = jest.fn().mockRejectedValue(new Error('fail'));
    const successHandler = jest.fn().mockResolvedValue(undefined);

    bus.on('test.event', failHandler);
    bus.on('test.event', successHandler);

    await bus.emit('test.event', {});

    expect(failHandler).toHaveBeenCalledTimes(1);
    expect(successHandler).toHaveBeenCalledTimes(1);
  });

  it('should remove handler with off()', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.on('test.event', handler);
    bus.off('test.event', handler);

    await bus.emit('test.event', {});

    expect(handler).not.toHaveBeenCalled();
  });

  it('should remove all handlers with removeAll()', async () => {
    const h1 = jest.fn().mockResolvedValue(undefined);
    const h2 = jest.fn().mockResolvedValue(undefined);
    bus.on('event.a', h1);
    bus.on('event.b', h2);

    bus.removeAll();

    await bus.emit('event.a', {});
    await bus.emit('event.b', {});

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('should include metadata in emitted events', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.on('test.event', handler);

    await bus.emit('test.event', { data: 1 }, { tenantId: 'tenant_123', userId: 'user_456' });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_123',
        userId: 'user_456',
        metadata: expect.objectContaining({ tenantId: 'tenant_123', userId: 'user_456' }),
      })
    );
  });

  it('should generate unique event IDs', async () => {
    const ids: string[] = [];
    bus.on('test.event', async (event) => { ids.push(event.id); });

    await bus.emit('test.event', {});
    await bus.emit('test.event', {});

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('should report listener count', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.on('test.event', h1);
    bus.on('test.event', h2);

    expect(bus.listenerCount('test.event')).toBe(2);
    expect(bus.listenerCount('other.event')).toBe(0);
  });
});
